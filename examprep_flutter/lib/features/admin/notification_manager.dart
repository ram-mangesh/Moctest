import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class NotificationManager extends ConsumerStatefulWidget {
  const NotificationManager({super.key});
  @override
  ConsumerState<NotificationManager> createState() => _NotificationManagerState();
}

class _NotificationManagerState extends ConsumerState<NotificationManager> {
  List<dynamic> _inactive = [];
  List<dynamic> _logs = [];
  bool _loading = true;
  String _activeTab = 'inactive'; // 'inactive' or 'logs'
  int? _sendingId;
  bool _sendingAll = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final dio = ref.read(dioClientProvider);
      if (_activeTab == 'inactive') {
        final res = await dio.get('/admin/notifications/inactive-students');
        if (mounted) setState(() { _inactive = res.data ?? []; _loading = false; });
      } else {
        final res = await dio.get('/admin/notifications/logs');
        if (mounted) setState(() { _logs = res.data ?? []; _loading = false; });
      }
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _sendSingle(int sid) async {
    setState(() => _sendingId = sid);
    try {
      await ref.read(dioClientProvider).post('/admin/notifications/send/$sid');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Notifications sent successfully!')));
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('❌ Failed to send notifications.')));
    }
    setState(() => _sendingId = null);
  }

  Future<void> _sendAll() async {
    setState(() => _sendingAll = true);
    try {
      final res = await ref.read(dioClientProvider).post('/admin/notifications/send-all');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✅ Sent notifications to ${res.data['totalNotified']} students.')));
      _fetchData();
    } catch (_) {}
    setState(() => _sendingAll = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.purple.withOpacity(0.09), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.purple.withOpacity(0.18))), child: const Text('📢 ALERT CENTER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.purple, letterSpacing: 1)))]),
        const SizedBox(height: 10),
        const Text('Inactive Student Alerts', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        const Text('Monitor students who haven\'t practiced recently. Trigger automated SMS, Voice calls, and Emails.', style: TextStyle(fontSize: 13, color: Colors.grey)),
        const SizedBox(height: 24),

        _tabs(),
        const SizedBox(height: 20),
        _panel(child: _loading ? const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())) : (_activeTab == 'inactive' ? _buildInactive() : _buildLogs())),
      ],
    );
  }

  Widget _tabs() {
    return Row(
      children: [
        _tabBtn('inactive', '⚠️ Inactive Students'),
        const SizedBox(width: 12),
        _tabBtn('logs', '📜 Notification Logs'),
      ],
    );
  }

  Widget _tabBtn(String val, String l) {
    bool active = _activeTab == val;
    return InkWell(
      onTap: () { setState(() => _activeTab = val); _fetchData(); },
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: active ? Colors.purple.withOpacity(0.1) : Colors.transparent, borderRadius: BorderRadius.circular(8)), child: Text(l, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: active ? Colors.purple : Colors.grey))),
    );
  }

  Widget _buildInactive() {
    return Column(
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Found ${_inactive.length} students inactive for 2+ days', style: const TextStyle(fontWeight: FontWeight.bold)),
          if (_inactive.isNotEmpty) ElevatedButton(onPressed: _sendingAll ? null : _sendAll, style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))), child: Text(_sendingAll ? 'Sending...' : '🚀 Notify All', style: const TextStyle(color: Colors.white))),
        ]),
        const SizedBox(height: 18),
        if (_inactive.isEmpty) const Center(child: Text('🎉 No inactive students found.', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)))
        else ..._inactive.map((s) => _studentCard(s)).toList(),
      ],
    );
  }

  Widget _studentCard(Map<String, dynamic> s) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey.withOpacity(0.1))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(s['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)), Text('${s['email']} • ${s['phone']}', style: const TextStyle(fontSize: 11, color: Colors.grey))])),
          Row(children: [
            Column(children: [Text('${s['daysInactive']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.red)), const Text('DAYS INACTIVE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey))]),
            const SizedBox(width: 18),
            ElevatedButton(onPressed: _sendingId == s['id'] ? null : () => _sendSingle(s['id']), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))), child: Text(_sendingId == s['id'] ? '...' : '🔔 Alert', style: const TextStyle(color: Colors.white))),
          ]),
        ],
      ),
    );
  }

  Widget _buildLogs() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recent Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 14),
        if (_logs.isEmpty) const Center(child: Text('No logs found.'))
        else Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.withOpacity(0.1))), child: Column(children: _logs.map((l) => _logRow(l)).toList())),
      ],
    );
  }

  Widget _logRow(Map<String, dynamic> l) {
    bool success = l['success'] ?? false;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey.withOpacity(0.05)))),
      child: Row(
        children: [
          Container(width: 38, height: 38, decoration: BoxDecoration(color: success ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Center(child: Text(l['channel'] == 'SMS' ? '📱' : (l['channel'] == 'CALL' ? '📞' : '📧'), style: const TextStyle(fontSize: 18)))),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(l['studentName'] ?? 'Student', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)), Text('${l['destination']} • ${l['sentAt']?.substring(11, 16) ?? ""}', style: const TextStyle(fontSize: 11, color: Colors.grey))])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: success ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(success ? '✅ Delivered' : '❌ Failed', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: success ? Colors.green : Colors.red))),
        ],
      ),
    );
  }

  Widget _panel({required Widget child}) => Container(width: double.infinity, padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: Colors.white.withOpacity(0.92), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.purple.withOpacity(0.1))), child: child);
}
