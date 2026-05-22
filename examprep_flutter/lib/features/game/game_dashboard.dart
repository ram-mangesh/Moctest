import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class GameDashboard extends ConsumerStatefulWidget {
  const GameDashboard({super.key});
  @override
  ConsumerState<GameDashboard> createState() => _GameDashboardState();
}

class _GameDashboardState extends ConsumerState<GameDashboard> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Map<String, dynamic>? _profile;
  List<dynamic> _leaderboard = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _load();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioClientProvider);
      final me = await dio.get('/user/gamification/me');
      final lb = await dio.get('/user/gamification/leaderboard');
      if (mounted) {
        setState(() {
          _profile = me.data ?? _demoProfile;
          _leaderboard = lb.data ?? _demoLeaderboard;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() { _profile = _demoProfile; _leaderboard = _demoLeaderboard; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final p = _profile!;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _heroCard(p),
            const SizedBox(height: 20),
            _tabs(),
            const SizedBox(height: 20),
            SizedBox(
              height: 600,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _badgesTab(p),
                  _streakTab(p),
                  _leaderboardTab(),
                  _levelsTab(p),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _heroCard(Map p) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                   Text(p['level']['icon'] ?? '', style: const TextStyle(fontSize: 40)),
                   const SizedBox(width: 12),
                   Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(p['level']['name'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                       Text('${p['totalXp']} XP total', style: TextStyle(color: Colors.indigo.shade100, fontSize: 13)),
                     ],
                   )
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Next: ${p['nextLevel']?['name'] ?? 'MAX'}', style: TextStyle(color: Colors.indigo.shade100, fontSize: 11)),
                  Text('${p['xpToNext']} XP', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  Text('to go', style: TextStyle(color: Colors.indigo.shade100, fontSize: 11)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          _xpBar(p['levelPct']),
          const SizedBox(height: 24),
          Row(
            children: [
              _miniStat('Tests done', '${p['totalTests']}'),
              _miniStat('Day streak', '🔥 ${p['streak']}'),
              _miniStat('Badges', '🏅 ${p['badges'].length}'),
            ],
          )
        ],
      ),
    );
  }

  Widget _xpBar(int pct) {
    return Column(
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Lvl 1', style: TextStyle(color: Colors.indigo.shade100, fontSize: 10)), Text('Lvl 2', style: TextStyle(color: Colors.indigo.shade100, fontSize: 10))]),
        const SizedBox(height: 6),
        Container(height: 10, width: double.infinity, decoration: BoxDecoration(color: Colors.indigo.shade900, borderRadius: BorderRadius.circular(10)), child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: pct / 100, child: Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10))))),
      ],
    );
  }

  Widget _miniStat(String l, String v) => Expanded(child: Container(padding: const EdgeInsets.symmetric(vertical: 12), margin: const EdgeInsets.symmetric(horizontal: 4), decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16)), child: Column(children: [Text(v, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)), Text(l, style: TextStyle(color: Colors.indigo.shade100, fontSize: 10))])));

  Widget _tabs() {
    return Container(
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
      child: TabBar(
        controller: _tabController,
        labelColor: const Color(0xFF6366F1),
        unselectedLabelColor: Colors.grey,
        indicatorColor: const Color(0xFF6366F1),
        indicatorWeight: 3,
        tabs: const [Tab(text: '🎖️ Badges'), Tab(text: '🔥 Streak'), Tab(text: '🏆 Leader'), Tab(text: '📊 Levels')],
      ),
    );
  }

  Widget _badgesTab(Map p) {
    final earned = List.from(p['badges']);
    return GridView.count(
      crossAxisCount: 2,
      padding: const EdgeInsets.all(16),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.1,
      children: _badgeMeta.entries.map((e) {
        bool unlocked = earned.contains(e.key);
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: unlocked ? Colors.white : Colors.grey.shade50,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: unlocked ? Colors.indigo.withOpacity(0.1) : Colors.grey.shade200),
            boxShadow: unlocked ? [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 10)] : [],
          ),
          child: Opacity(
            opacity: unlocked ? 1 : 0.4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(e.value['icon'], style: const TextStyle(fontSize: 32)),
                const SizedBox(height: 10),
                Text(e.value['label'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(e.value['desc'], style: const TextStyle(fontSize: 10, color: Colors.grey), maxLines: 2),
                const Spacer(),
                Text(unlocked ? '✓ Earned' : '🔒 Locked', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: unlocked ? Colors.green : Colors.grey)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _streakTab(Map p) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [const Text('🔥', style: TextStyle(fontSize: 48)), const SizedBox(width: 14), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('${p['streak']} days', style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold)), const Text('current streak', style: TextStyle(color: Colors.grey))])]),
          const SizedBox(height: 24),
          const Text('Last 30 days', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),
          Wrap(spacing: 6, runSpacing: 6, children: List.generate(30, (i) => Container(width: 30, height: 30, decoration: BoxDecoration(color: i < (p['streak'] as int) ? Colors.indigo : Colors.grey.shade200, borderRadius: BorderRadius.circular(6))))),
        ],
      ),
    );
  }

  Widget _leaderboardTab() {
     return ListView.separated(
       padding: const EdgeInsets.all(16),
       itemCount: _leaderboard.length,
       separatorBuilder: (_, __) => const SizedBox(height: 8),
       itemBuilder: (context, i) {
         final e = _leaderboard[i];
         return Container(
           padding: const EdgeInsets.all(14),
           decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
           child: Row(
             children: [
               SizedBox(width: 32, child: Text(i < 3 ? ['🥇','🥈','🥉'][i] : '#${i+1}', style: const TextStyle(fontWeight: FontWeight.bold))),
               CircleAvatar(child: Text(e['name'][0])),
               const SizedBox(width: 12),
               Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(e['name'], style: const TextStyle(fontWeight: FontWeight.bold)), Text('${e['levelIcon']} ${e['level']}', style: const TextStyle(fontSize: 10, color: Colors.grey))])),
               Text('${e['totalXp']} XP', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.amber)),
             ],
           ),
         );
       },
     );
  }

  Widget _levelsTab(Map p) => const Center(child: Text('Levels List (Logic parity)'));

  final Map<String, dynamic> _demoProfile = {
    'totalXp': 1240, 'levelPct': 62, 'streak': 8, 'totalTests': 34, 'badges': ["FIRST_ATTEMPT", "STREAK_7", "NIGHT_OWL", "COMEBACK"],
    'level': {'name': "Scholar", 'icon': "🎓", 'minXp': 1000},
    'nextLevel': {'name': "Expert", 'icon': "⚡", 'minXp': 2000},
    'xpToNext': 760,
  };

  final List<dynamic> _demoLeaderboard = [
    {'userId': 99, 'name': "Abhishek Sharma", 'totalXp': 4200, 'level': "Master", 'levelIcon': "🏆", 'streak': 22, 'badges': 7},
    {'userId': 2, 'name': "Priya Patel", 'totalXp': 3100, 'level': "Expert", 'levelIcon': "⚡", 'streak': 15, 'badges': 6},
    {'userId': 5, 'name': "Arun Verma", 'totalXp': 1240, 'level': "Scholar", 'levelIcon': "🎓", 'streak': 5, 'badges': 3},
  ];

  final Map<String, dynamic> _badgeMeta = {
    'FIRST_ATTEMPT': {'icon': "🎯", 'label': "First Step", 'desc': "Complete your first test"},
    'PERFECT_SCORE': {'icon': "💯", 'label': "Perfectionist", 'desc': "Score 100% on any test"},
    'STREAK_7': {'icon': "🔥", 'label': "On Fire", 'desc': "7-day study streak"},
    'STREAK_30': {'icon': "⚡", 'label': "Unstoppable", 'desc': "30-day study streak"},
    'CENTURY': {'icon': "💪", 'label': "Century Club", 'desc': "Complete 100 tests"},
    'NIGHT_OWL': {'icon': "🌙", 'label': "Night Owl", 'desc': "Study after 10 PM"},
    'EARLY_BIRD': {'icon': "🌅", 'label': "Early Bird", 'desc': "Study before 7 AM"},
    'COMEBACK': {'icon': "📈", 'label': "Comeback Kid", 'desc': "Improve score by 20%+"},
  };
}
