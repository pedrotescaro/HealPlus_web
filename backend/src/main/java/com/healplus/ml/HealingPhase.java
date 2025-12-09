package com.healplus.ml;

public enum HealingPhase {
    HEMOSTASIS("Hemostasia", "Fase inicial de coagulação", 0, 3),
    INFLAMMATORY("Inflamatória", "Resposta inflamatória, limpeza da ferida", 1, 7),
    PROLIFERATIVE("Proliferativa", "Formação de tecido de granulação", 7, 21),
    REMODELING("Remodelação", "Maturação e fortalecimento do tecido", 21, 365),
    CHRONIC("Crônica", "Ferida estagnada, sem evolução", -1, -1),
    INFECTED("Infectada", "Sinais de infecção presentes", -1, -1);

    private final String displayName;
    private final String description;
    private final int typicalStartDay;
    private final int typicalEndDay;

    HealingPhase(String displayName, String description, int typicalStartDay, int typicalEndDay) {
        this.displayName = displayName;
        this.description = description;
        this.typicalStartDay = typicalStartDay;
        this.typicalEndDay = typicalEndDay;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public int getTypicalStartDay() { return typicalStartDay; }
    public int getTypicalEndDay() { return typicalEndDay; }
}
