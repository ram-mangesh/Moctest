import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class RoadmapPdfButton extends ConsumerStatefulWidget {
  final String? attemptId;
  const RoadmapPdfButton({super.key, this.attemptId});

  @override
  ConsumerState<RoadmapPdfButton> createState() => _RoadmapPdfButtonState();
}

class _RoadmapPdfButtonState extends ConsumerState<RoadmapPdfButton> {
  bool _loading = false;

  Future<void> _generatePdf() async {
    if (widget.attemptId == null) return;
    setState(() => _loading = true);
    try {
      // In a real app, this might open a URL or download a file.
      // The React version calls a backend endpoint that generates a PDF.
      final url = Uri.parse("http://localhost:8089/api/user/roadmap/download?attemptId=${widget.attemptId}");
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        throw 'Could not launch $url';
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate roadmap PDF')));
      }
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _loading ? null : _generatePdf,
        icon: _loading ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(LucideIcons.fileText, size: 16),
        label: Text(_loading ? "GENERATING PDF..." : "DOWNLOAD ROADMAP PDF"),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigo.withOpacity(0.1),
          foregroundColor: Colors.indigo,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.indigo.withOpacity(0.2))),
        ),
      ),
    );
  }
}
