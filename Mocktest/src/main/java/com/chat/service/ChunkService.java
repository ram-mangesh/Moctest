package com.chat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ChunkService {

    public List<String> chunk(String text) {
        System.out.println("✂️ Chunking text...");

        List<String> chunks = new ArrayList<>();

        for (int i = 0; i < text.length(); i += 800) {
            chunks.add(text.substring(i, Math.min(i + 800, text.length())));
        }

        System.out.println("📦 Total chunks created: " + chunks.size());
        return chunks;
    }
}