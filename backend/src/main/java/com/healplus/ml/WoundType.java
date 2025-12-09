package com.healplus.ml;

public enum WoundType {
    PRESSURE_ULCER("Úlcera por Pressão", "Lesão causada por pressão prolongada sobre a pele"),
    DIABETIC_ULCER("Úlcera Diabética", "Ferida em pacientes diabéticos, geralmente nos pés"),
    VENOUS_ULCER("Úlcera Venosa", "Causada por insuficiência venosa crônica"),
    ARTERIAL_ULCER("Úlcera Arterial", "Causada por doença arterial periférica"),
    SURGICAL_WOUND("Ferida Cirúrgica", "Incisão resultante de procedimento cirúrgico"),
    TRAUMATIC_WOUND("Ferida Traumática", "Lesão causada por trauma físico"),
    BURN_WOUND("Queimadura", "Lesão causada por agentes térmicos, químicos ou elétricos"),
    LACERATION("Laceração", "Corte irregular na pele"),
    ABRASION("Abrasão", "Ferida superficial por fricção"),
    UNKNOWN("Desconhecido", "Tipo de ferida não identificado");

    private final String displayName;
    private final String description;

    WoundType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
}
