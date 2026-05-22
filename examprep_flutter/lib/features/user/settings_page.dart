import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Account'),
            subtitle: const Text('Manage your profile'),
            trailing: const Icon(Icons.person),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Notifications'),
            subtitle: const Text('Manage alerts'),
            trailing: const Icon(Icons.notifications),
            onTap: () {},
          ),
          ListTile(
            title: const Text('About'),
            subtitle: const Text('Version 1.0.0'),
            trailing: const Icon(Icons.info),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
