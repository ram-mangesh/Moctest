package com.chat.dto;

import java.util.List;

public class AnswerDTO {

    private String selected;
    private List<String> selectedMultiple;
    private Double selectedNumeric;

    public String getSelected() { return selected; }
    public void setSelected(String selected) { this.selected = selected; }

    public List<String> getSelectedMultiple() { return selectedMultiple; }
    public void setSelectedMultiple(List<String> selectedMultiple) { this.selectedMultiple = selectedMultiple; }

    public Double getSelectedNumeric() { return selectedNumeric; }
    public void setSelectedNumeric(Double selectedNumeric) { this.selectedNumeric = selectedNumeric; }
}