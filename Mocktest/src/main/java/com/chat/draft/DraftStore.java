package com.chat.draft;

import java.util.ArrayList;
import java.util.List;

import com.chat.entity.Question;

public class DraftStore {

    private static List<Question> drafts = new ArrayList<>();

    public static void set(List<Question> list) {
        drafts = list;
        System.out.println("🗂 DraftStore updated");
    }

    public static List<Question> get() {
        return drafts;
    }

    public static void clear() {
        drafts.clear();
        System.out.println("🧹 DraftStore cleared");
    }
}