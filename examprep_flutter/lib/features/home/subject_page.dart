import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';

class SubjectPage extends ConsumerStatefulWidget {
  final String examId;
  const SubjectPage({super.key, required this.examId});
  @override
  ConsumerState<SubjectPage> createState() => _SubjectPageState();
}

class _SubjectPageState extends ConsumerState<SubjectPage> {
  bool _loading = true;
  List<dynamic> _subjects = [];
  String _examName = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = ref.read(dioClientProvider);
    try {
      final res = await api.get('/exam-data/subjects/${widget.examId}');
      if (mounted) setState(() { _subjects = res.data as List; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return UserLayout(
      title: _examName.isEmpty ? 'Subjects' : _examName,
      showBack: true,
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : GridView.builder(
              padding: const EdgeInsets.all(20),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: MediaQuery.of(context).size.width > 800 ? 3 : 2,
                childAspectRatio: 1.3, crossAxisSpacing: 14, mainAxisSpacing: 14,
              ),
              itemCount: _subjects.length,
              itemBuilder: (_, i) {
                final s = _subjects[i] as Map<String, dynamic>;
                return GestureDetector(
                  onTap: () => context.go('/subject/${s['id']}'),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.primary.withOpacity(0.14), width: 1.5),
                      boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.07), blurRadius: 16)],
                    ),
                    padding: const EdgeInsets.all(18),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('📖', style: TextStyle(fontSize: 26)),
                      const SizedBox(height: 10),
                      Text(s['name'] ?? 'Subject', style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.inkDark)),
                    ]),
                  ),
                );
              },
            ),
    );
  }
}
