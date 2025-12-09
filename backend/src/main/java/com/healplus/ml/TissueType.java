package com.healplus.ml;

public enum TissueType {
    NECROTIC("Tecido Necrótico", "Tecido morto, escuro/preto", "#1a1a1a", 0),
    SLOUGH("Esfacelo", "Tecido amarelado/desvitalizado", "#c9a227", 1),
    GRANULATION("Tecido de Granulação", "Tecido vermelho vivo, saudável", "#cc3333", 2),
    EPITHELIAL("Tecido Epitelial", "Tecido rosa, nova pele", "#ffb3b3", 3),
    HYPERGRANULATION("Hipergranulação", "Tecido de granulação excessivo", "#8b0000", 2),
    FIBRIN("Fibrina", "Camada amarelada de proteína", "#f5deb3", 1),
    ESCHAR("Escara", "Crosta seca e dura", "#2d1810", 0),
    HEALTHY_SKIN("Pele Saudável", "Pele íntegra ao redor da ferida", "#ffd5b4", 4);

    private final String displayName;
    private final String description;
    private final String colorHex;
    private final int healingStage;

    TissueType(String displayName, String description, String colorHex, int healingStage) {
        this.displayName = displayName;
        this.description = description;
        this.colorHex = colorHex;
        this.healingStage = healingStage;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public String getColorHex() { return colorHex; }
    public int getHealingStage() { return healingStage; }
}
