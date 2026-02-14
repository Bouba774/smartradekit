// Tooltips d'aide contextuelle pour Smart Trade Kit
// Support multilingue pour les 8 langues de l'application

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ar' | 'tr';

export interface MultilingualTooltip {
  fr: string;
  en: string;
  es: string;
  de: string;
  it: string;
  pt: string;
  ar: string;
  tr: string;
}

// === DONNÉES D'UN TRADE (FORMULAIRE) ===
export const tradeFormTooltips: Record<string, MultilingualTooltip> = {
  instrument: {
    fr: "Actif tradé (Forex, crypto, indices, matières premières).",
    en: "Traded asset (Forex, crypto, indices, commodities).",
    es: "Activo negociado (Forex, cripto, índices, materias primas).",
    de: "Gehandeltes Asset (Forex, Krypto, Indizes, Rohstoffe).",
    it: "Asset negoziato (Forex, crypto, indici, materie prime).",
    pt: "Ativo negociado (Forex, cripto, índices, commodities).",
    ar: "الأصل المتداول (فوركس، عملات رقمية، مؤشرات، سلع).",
    tr: "İşlem gören varlık (Forex, kripto, endeksler, emtialar)."
  },
  direction: {
    fr: "Achat (Buy) ou vente (Sell).",
    en: "Buy or Sell.",
    es: "Compra (Buy) o venta (Sell).",
    de: "Kauf (Buy) oder Verkauf (Sell).",
    it: "Acquisto (Buy) o vendita (Sell).",
    pt: "Compra (Buy) ou venda (Sell).",
    ar: "شراء أو بيع.",
    tr: "Alış (Buy) veya satış (Sell)."
  },
  dateTime: {
    fr: "Moment réel où le trade a été exécuté sur le marché.",
    en: "Actual time when the trade was executed on the market.",
    es: "Momento real en que se ejecutó la operación en el mercado.",
    de: "Tatsächlicher Zeitpunkt der Trade-Ausführung am Markt.",
    it: "Momento reale in cui il trade è stato eseguito sul mercato.",
    pt: "Momento real em que a operação foi executada no mercado.",
    ar: "الوقت الفعلي لتنفيذ الصفقة في السوق.",
    tr: "İşlemin piyasada gerçekleştirildiği gerçek zaman."
  },
  entryPrice: {
    fr: "Prix exact auquel la position a été ouverte.",
    en: "Exact price at which the position was opened.",
    es: "Precio exacto al que se abrió la posición.",
    de: "Genauer Preis, zu dem die Position eröffnet wurde.",
    it: "Prezzo esatto al quale è stata aperta la posizione.",
    pt: "Preço exato em que a posição foi aberta.",
    ar: "السعر الدقيق الذي فُتحت عنده الصفقة.",
    tr: "Pozisyonun açıldığı tam fiyat."
  },
  exitPrice: {
    fr: "Prix exact auquel la position a été clôturée.",
    en: "Exact price at which the position was closed.",
    es: "Precio exacto al que se cerró la posición.",
    de: "Genauer Preis, zu dem die Position geschlossen wurde.",
    it: "Prezzo esatto al quale è stata chiusa la posizione.",
    pt: "Preço exato em que a posição foi fechada.",
    ar: "السعر الدقيق الذي أُغلقت عنده الصفقة.",
    tr: "Pozisyonun kapandığı tam fiyat."
  },
  stopLoss: {
    fr: "Niveau de prix où la perte est automatiquement coupée.",
    en: "Price level where the loss is automatically cut.",
    es: "Nivel de precio donde la pérdida se corta automáticamente.",
    de: "Preisniveau, bei dem der Verlust automatisch begrenzt wird.",
    it: "Livello di prezzo dove la perdita viene tagliata automaticamente.",
    pt: "Nível de preço onde a perda é automaticamente cortada.",
    ar: "مستوى السعر الذي يتم عنده قطع الخسارة تلقائياً.",
    tr: "Kaybın otomatik olarak kesildiği fiyat seviyesi."
  },
  takeProfit: {
    fr: "Niveau de prix où le gain est automatiquement sécurisé.",
    en: "Price level where the profit is automatically secured.",
    es: "Nivel de precio donde la ganancia se asegura automáticamente.",
    de: "Preisniveau, bei dem der Gewinn automatisch gesichert wird.",
    it: "Livello di prezzo dove il profitto viene assicurato automaticamente.",
    pt: "Nível de preço onde o lucro é automaticamente garantido.",
    ar: "مستوى السعر الذي يتم عنده تأمين الربح تلقائياً.",
    tr: "Kârın otomatik olarak güvence altına alındığı fiyat seviyesi."
  },
  lotSize: {
    fr: "Volume réel de la position sur le marché.",
    en: "Actual volume of the position on the market.",
    es: "Volumen real de la posición en el mercado.",
    de: "Tatsächliches Volumen der Position am Markt.",
    it: "Volume reale della posizione sul mercato.",
    pt: "Volume real da posição no mercado.",
    ar: "الحجم الفعلي للصفقة في السوق.",
    tr: "Piyasadaki pozisyonun gerçek hacmi."
  },
  riskPercent: {
    fr: "Pourcentage du capital risqué sur ce trade.",
    en: "Percentage of capital risked on this trade.",
    es: "Porcentaje del capital arriesgado en esta operación.",
    de: "Prozentsatz des riskierten Kapitals bei diesem Trade.",
    it: "Percentuale del capitale rischiato in questo trade.",
    pt: "Porcentagem do capital arriscado nesta operação.",
    ar: "نسبة رأس المال المخاطر به في هذه الصفقة.",
    tr: "Bu işlemde riske edilen sermaye yüzdesi."
  },
  riskCash: {
    fr: "Montant en devise risqué sur ce trade.",
    en: "Currency amount risked on this trade.",
    es: "Monto en divisa arriesgado en esta operación.",
    de: "Währungsbetrag, der bei diesem Trade riskiert wird.",
    it: "Importo in valuta rischiato in questo trade.",
    pt: "Valor em moeda arriscado nesta operação.",
    ar: "المبلغ بالعملة المخاطر به في هذه الصفقة.",
    tr: "Bu işlemde riske edilen para birimi miktarı."
  },
  pnl: {
    fr: "Résultat final du trade après clôture.",
    en: "Final result of the trade after closing.",
    es: "Resultado final de la operación después del cierre.",
    de: "Endergebnis des Trades nach Schließung.",
    it: "Risultato finale del trade dopo la chiusura.",
    pt: "Resultado final da operação após fechamento.",
    ar: "النتيجة النهائية للصفقة بعد الإغلاق.",
    tr: "Kapanış sonrası işlemin nihai sonucu."
  },
  rrRatio: {
    fr: "Ratio risque/rendement réel du trade.",
    en: "Actual risk/reward ratio of the trade.",
    es: "Ratio riesgo/recompensa real de la operación.",
    de: "Tatsächliches Risiko/Rendite-Verhältnis des Trades.",
    it: "Rapporto rischio/rendimento reale del trade.",
    pt: "Relação risco/recompensa real da operação.",
    ar: "نسبة المخاطرة/العائد الفعلية للصفقة.",
    tr: "İşlemin gerçek risk/ödül oranı."
  },
  media: {
    fr: "Preuves ou commentaires liés à ce trade (images, vidéos, audio).",
    en: "Evidence or comments related to this trade (images, videos, audio).",
    es: "Pruebas o comentarios relacionados con esta operación (imágenes, videos, audio).",
    de: "Beweise oder Kommentare zu diesem Trade (Bilder, Videos, Audio).",
    it: "Prove o commenti relativi a questo trade (immagini, video, audio).",
    pt: "Provas ou comentários relacionados a esta operação (imagens, vídeos, áudio).",
    ar: "أدلة أو تعليقات متعلقة بهذه الصفقة (صور، فيديو، صوت).",
    tr: "Bu işlemle ilgili kanıtlar veya yorumlar (resimler, videolar, ses)."
  },
  setup: {
    fr: "Stratégie ou configuration technique utilisée pour ce trade.",
    en: "Strategy or technical setup used for this trade.",
    es: "Estrategia o configuración técnica utilizada para esta operación.",
    de: "Strategie oder technisches Setup für diesen Trade.",
    it: "Strategia o configurazione tecnica utilizzata per questo trade.",
    pt: "Estratégia ou configuração técnica usada para esta operação.",
    ar: "الاستراتيجية أو الإعداد الفني المستخدم لهذه الصفقة.",
    tr: "Bu işlem için kullanılan strateji veya teknik kurulum."
  },
  timeframe: {
    fr: "Unité de temps du graphique analysé.",
    en: "Time unit of the analyzed chart.",
    es: "Unidad de tiempo del gráfico analizado.",
    de: "Zeiteinheit des analysierten Charts.",
    it: "Unità di tempo del grafico analizzato.",
    pt: "Unidade de tempo do gráfico analisado.",
    ar: "الوحدة الزمنية للرسم البياني المحلل.",
    tr: "Analiz edilen grafiğin zaman birimi."
  },
  emotion: {
    fr: "État émotionnel ressenti lors de la prise de position.",
    en: "Emotional state felt when taking the position.",
    es: "Estado emocional sentido al tomar la posición.",
    de: "Emotionaler Zustand beim Eingehen der Position.",
    it: "Stato emotivo percepito durante l'apertura della posizione.",
    pt: "Estado emocional sentido ao abrir a posição.",
    ar: "الحالة العاطفية المحسوسة عند فتح الصفقة.",
    tr: "Pozisyon alırken hissedilen duygusal durum."
  },
  notes: {
    fr: "Notes personnelles et observations sur le trade.",
    en: "Personal notes and observations about the trade.",
    es: "Notas personales y observaciones sobre la operación.",
    de: "Persönliche Notizen und Beobachtungen zum Trade.",
    it: "Note personali e osservazioni sul trade.",
    pt: "Notas pessoais e observações sobre a operação.",
    ar: "ملاحظات شخصية ومراقبات حول الصفقة.",
    tr: "İşlem hakkında kişisel notlar ve gözlemler."
  },
  exitMethod: {
    fr: "Méthode utilisée pour clôturer la position (SL, TP, manuel).",
    en: "Method used to close the position (SL, TP, manual).",
    es: "Método utilizado para cerrar la posición (SL, TP, manual).",
    de: "Methode zum Schließen der Position (SL, TP, manuell).",
    it: "Metodo utilizzato per chiudere la posizione (SL, TP, manuale).",
    pt: "Método usado para fechar a posição (SL, TP, manual).",
    ar: "الطريقة المستخدمة لإغلاق الصفقة (SL، TP، يدوي).",
    tr: "Pozisyonu kapatmak için kullanılan yöntem (SL, TP, manuel)."
  },
  tags: {
    fr: "Étiquettes pour catégoriser et retrouver facilement le trade.",
    en: "Tags to categorize and easily find the trade.",
    es: "Etiquetas para categorizar y encontrar fácilmente la operación.",
    de: "Tags zur Kategorisierung und einfachen Auffindung des Trades.",
    it: "Tag per categorizzare e trovare facilmente il trade.",
    pt: "Tags para categorizar e encontrar facilmente a operação.",
    ar: "علامات لتصنيف الصفقة وإيجادها بسهولة.",
    tr: "İşlemi kategorize etmek ve kolayca bulmak için etiketler."
  },
  exitDateTime: {
    fr: "Moment réel où le trade a été clôturé.",
    en: "Actual time when the trade was closed.",
    es: "Momento real en que se cerró la operación.",
    de: "Tatsächlicher Zeitpunkt der Trade-Schließung.",
    it: "Momento reale in cui il trade è stato chiuso.",
    pt: "Momento real em que a operação foi fechada.",
    ar: "الوقت الفعلي لإغلاق الصفقة.",
    tr: "İşlemin kapatıldığı gerçek zaman."
  },
  duration: {
    fr: "Durée entre l'ouverture et la fermeture du trade.",
    en: "Duration between opening and closing the trade.",
    es: "Duración entre la apertura y el cierre de la operación.",
    de: "Dauer zwischen Eröffnung und Schließung des Trades.",
    it: "Durata tra l'apertura e la chiusura del trade.",
    pt: "Duração entre a abertura e o fechamento da operação.",
    ar: "المدة بين فتح وإغلاق الصفقة.",
    tr: "İşlemin açılışı ve kapanışı arasındaki süre."
  },
};

// === STATISTIQUES PRINCIPALES ===
export const mainStatsTooltips: Record<string, MultilingualTooltip> = {
  totalTrades: {
    fr: "Total des trades enregistrés.",
    en: "Total recorded trades.",
    es: "Total de operaciones registradas.",
    de: "Gesamtzahl der erfassten Trades.",
    it: "Totale dei trade registrati.",
    pt: "Total de operações registradas.",
    ar: "إجمالي الصفقات المسجلة.",
    tr: "Toplam kayıtlı işlem sayısı."
  },
  winningTrades: {
    fr: "Nombre de trades clôturés en gain.",
    en: "Number of trades closed in profit.",
    es: "Número de operaciones cerradas con ganancia.",
    de: "Anzahl der mit Gewinn geschlossenen Trades.",
    it: "Numero di trade chiusi in profitto.",
    pt: "Número de operações fechadas com lucro.",
    ar: "عدد الصفقات المغلقة بربح.",
    tr: "Kârla kapanan işlem sayısı."
  },
  losingTrades: {
    fr: "Nombre de trades clôturés en perte.",
    en: "Number of trades closed in loss.",
    es: "Número de operaciones cerradas con pérdida.",
    de: "Anzahl der mit Verlust geschlossenen Trades.",
    it: "Numero di trade chiusi in perdita.",
    pt: "Número de operações fechadas com perda.",
    ar: "عدد الصفقات المغلقة بخسارة.",
    tr: "Zararla kapanan işlem sayısı."
  },
  winrate: {
    fr: "Pourcentage de trades gagnants. Formule : (Trades gagnants / Total trades) × 100",
    en: "Percentage of winning trades. Formula: (Winning trades / Total trades) × 100",
    es: "Porcentaje de operaciones ganadoras. Fórmula: (Operaciones ganadoras / Total) × 100",
    de: "Prozentsatz der Gewinn-Trades. Formel: (Gewinn-Trades / Gesamt) × 100",
    it: "Percentuale di trade vincenti. Formula: (Trade vincenti / Totale) × 100",
    pt: "Porcentagem de operações vencedoras. Fórmula: (Operações vencedoras / Total) × 100",
    ar: "نسبة الصفقات الرابحة. الصيغة: (الصفقات الرابحة / الإجمالي) × 100",
    tr: "Kazanan işlem yüzdesi. Formül: (Kazanan işlemler / Toplam) × 100"
  },
  breakeven: {
    fr: "Trades clôturés sans gain ni perte.",
    en: "Trades closed with no profit or loss.",
    es: "Operaciones cerradas sin ganancia ni pérdida.",
    de: "Trades ohne Gewinn oder Verlust geschlossen.",
    it: "Trade chiusi senza profitto né perdita.",
    pt: "Operações fechadas sem lucro nem perda.",
    ar: "صفقات مغلقة بدون ربح أو خسارة.",
    tr: "Kâr veya zarar olmadan kapanan işlemler."
  },
  totalProfit: {
    fr: "Somme de tous les gains et pertes.",
    en: "Sum of all gains and losses.",
    es: "Suma de todas las ganancias y pérdidas.",
    de: "Summe aller Gewinne und Verluste.",
    it: "Somma di tutti i guadagni e perdite.",
    pt: "Soma de todos os ganhos e perdas.",
    ar: "مجموع جميع الأرباح والخسائر.",
    tr: "Tüm kazanç ve kayıpların toplamı."
  },
  netProfit: {
    fr: "Gain réel après déduction de toutes les pertes.",
    en: "Actual profit after deducting all losses.",
    es: "Ganancia real después de deducir todas las pérdidas.",
    de: "Tatsächlicher Gewinn nach Abzug aller Verluste.",
    it: "Profitto reale dopo aver dedotto tutte le perdite.",
    pt: "Lucro real após deduzir todas as perdas.",
    ar: "الربح الفعلي بعد خصم جميع الخسائر.",
    tr: "Tüm kayıplar düşüldükten sonraki gerçek kâr."
  },
  maxDrawdown: {
    fr: "Perte maximale subie sur une période donnée.",
    en: "Maximum loss experienced over a given period.",
    es: "Pérdida máxima experimentada en un período determinado.",
    de: "Maximaler Verlust in einem bestimmten Zeitraum.",
    it: "Perdita massima subita in un determinato periodo.",
    pt: "Perda máxima experimentada em um período determinado.",
    ar: "أقصى خسارة في فترة معينة.",
    tr: "Belirli bir dönemde yaşanan maksimum kayıp."
  },
  profitFactor: {
    fr: "Rapport entre gains totaux et pertes totales. Formule : Gains totaux ÷ Pertes totales",
    en: "Ratio of total gains to total losses. Formula: Total gains ÷ Total losses",
    es: "Ratio de ganancias totales sobre pérdidas totales. Fórmula: Ganancias totales ÷ Pérdidas totales",
    de: "Verhältnis von Gesamtgewinnen zu Gesamtverlusten. Formel: Gesamtgewinne ÷ Gesamtverluste",
    it: "Rapporto tra guadagni totali e perdite totali. Formula: Guadagni totali ÷ Perdite totali",
    pt: "Relação entre ganhos totais e perdas totais. Fórmula: Ganhos totais ÷ Perdas totais",
    ar: "نسبة الأرباح الإجمالية إلى الخسائر الإجمالية. الصيغة: الأرباح ÷ الخسائر",
    tr: "Toplam kazançların toplam kayıplara oranı. Formül: Toplam kazançlar ÷ Toplam kayıplar"
  },
  expectancy: {
    fr: "Gain moyen attendu par trade. Formule : (Win rate × gain moyen) − (Loss rate × perte moyenne)",
    en: "Average expected gain per trade. Formula: (Win rate × avg gain) − (Loss rate × avg loss)",
    es: "Ganancia promedio esperada por operación. Fórmula: (Tasa de victorias × ganancia promedio) − (Tasa de pérdidas × pérdida promedio)",
    de: "Erwarteter durchschnittlicher Gewinn pro Trade. Formel: (Gewinnrate × Durchschnittsgewinn) − (Verlustrate × Durchschnittsverlust)",
    it: "Guadagno medio atteso per trade. Formula: (Win rate × guadagno medio) − (Loss rate × perdita media)",
    pt: "Ganho médio esperado por operação. Fórmula: (Taxa de vitória × ganho médio) − (Taxa de perda × perda média)",
    ar: "الربح المتوقع لكل صفقة. الصيغة: (معدل الربح × متوسط الربح) − (معدل الخسارة × متوسط الخسارة)",
    tr: "İşlem başına beklenen ortalama kazanç. Formül: (Kazanma oranı × ort. kazanç) − (Kaybetme oranı × ort. kayıp)"
  },
  avgRR: {
    fr: "Moyenne des ratios risque/rendement réels.",
    en: "Average of actual risk/reward ratios.",
    es: "Promedio de los ratios riesgo/recompensa reales.",
    de: "Durchschnitt der tatsächlichen Risiko/Rendite-Verhältnisse.",
    it: "Media dei rapporti rischio/rendimento reali.",
    pt: "Média das relações risco/recompensa reais.",
    ar: "متوسط نسب المخاطرة/العائد الفعلية.",
    tr: "Gerçek risk/ödül oranlarının ortalaması."
  },
  bestProfit: {
    fr: "Gain le plus élevé sur un seul trade.",
    en: "Highest profit on a single trade.",
    es: "Mayor ganancia en una sola operación.",
    de: "Höchster Gewinn bei einem einzelnen Trade.",
    it: "Profitto più alto su un singolo trade.",
    pt: "Maior lucro em uma única operação.",
    ar: "أعلى ربح في صفقة واحدة.",
    tr: "Tek bir işlemde en yüksek kâr."
  },
  worstLoss: {
    fr: "Perte la plus importante sur un seul trade.",
    en: "Largest loss on a single trade.",
    es: "Mayor pérdida en una sola operación.",
    de: "Größter Verlust bei einem einzelnen Trade.",
    it: "Perdita maggiore su un singolo trade.",
    pt: "Maior perda em uma única operação.",
    ar: "أكبر خسارة في صفقة واحدة.",
    tr: "Tek bir işlemde en büyük kayıp."
  },
  avgProfitPerTrade: {
    fr: "Gain moyen par trade gagnant.",
    en: "Average profit per winning trade.",
    es: "Ganancia promedio por operación ganadora.",
    de: "Durchschnittlicher Gewinn pro Gewinn-Trade.",
    it: "Profitto medio per trade vincente.",
    pt: "Lucro médio por operação vencedora.",
    ar: "متوسط الربح لكل صفقة رابحة.",
    tr: "Kazanan işlem başına ortalama kâr."
  },
  avgLossPerTrade: {
    fr: "Perte moyenne par trade perdant.",
    en: "Average loss per losing trade.",
    es: "Pérdida promedio por operación perdedora.",
    de: "Durchschnittlicher Verlust pro Verlust-Trade.",
    it: "Perdita media per trade perdente.",
    pt: "Perda média por operação perdedora.",
    ar: "متوسط الخسارة لكل صفقة خاسرة.",
    tr: "Kaybeden işlem başına ortalama kayıp."
  },
  avgTradeResult: {
    fr: "Résultat moyen de tous les trades.",
    en: "Average result of all trades.",
    es: "Resultado promedio de todas las operaciones.",
    de: "Durchschnittliches Ergebnis aller Trades.",
    it: "Risultato medio di tutti i trade.",
    pt: "Resultado médio de todas as operações.",
    ar: "متوسط نتيجة جميع الصفقات.",
    tr: "Tüm işlemlerin ortalama sonucu."
  },
  buyPositions: {
    fr: "Nombre de positions acheteuses (Buy/Long).",
    en: "Number of buy positions (Buy/Long).",
    es: "Número de posiciones de compra (Buy/Long).",
    de: "Anzahl der Kaufpositionen (Buy/Long).",
    it: "Numero di posizioni di acquisto (Buy/Long).",
    pt: "Número de posições de compra (Buy/Long).",
    ar: "عدد صفقات الشراء (Buy/Long).",
    tr: "Alış pozisyonu sayısı (Buy/Long)."
  },
  sellPositions: {
    fr: "Nombre de positions vendeuses (Sell/Short).",
    en: "Number of sell positions (Sell/Short).",
    es: "Número de posiciones de venta (Sell/Short).",
    de: "Anzahl der Verkaufspositionen (Sell/Short).",
    it: "Numero di posizioni di vendita (Sell/Short).",
    pt: "Número de posições de venda (Sell/Short).",
    ar: "عدد صفقات البيع (Sell/Short).",
    tr: "Satış pozisyonu sayısı (Sell/Short)."
  },
  avgLotSize: {
    fr: "Volume moyen des positions prises.",
    en: "Average volume of positions taken.",
    es: "Volumen promedio de las posiciones tomadas.",
    de: "Durchschnittliches Volumen der eingegangenen Positionen.",
    it: "Volume medio delle posizioni prese.",
    pt: "Volume médio das posições abertas.",
    ar: "متوسط حجم الصفقات المفتوحة.",
    tr: "Açılan pozisyonların ortalama hacmi."
  },
  totalLots: {
    fr: "Somme totale des volumes tradés.",
    en: "Total sum of traded volumes.",
    es: "Suma total de los volúmenes negociados.",
    de: "Gesamtsumme der gehandelten Volumen.",
    it: "Somma totale dei volumi scambiati.",
    pt: "Soma total dos volumes negociados.",
    ar: "مجموع الأحجام المتداولة.",
    tr: "İşlem gören toplam hacim."
  },
};

// === GESTION DU TEMPS ===
export const timeTooltips: Record<string, MultilingualTooltip> = {
  timeInPosition: {
    fr: "Durée entre l'ouverture et la fermeture du trade.",
    en: "Duration between opening and closing the trade.",
    es: "Duración entre la apertura y el cierre de la operación.",
    de: "Dauer zwischen Eröffnung und Schließung des Trades.",
    it: "Durata tra l'apertura e la chiusura del trade.",
    pt: "Duração entre a abertura e o fechamento da operação.",
    ar: "المدة بين فتح وإغلاق الصفقة.",
    tr: "İşlemin açılışı ve kapanışı arasındaki süre."
  },
  avgTimeInPosition: {
    fr: "Durée moyenne de maintien d'un trade.",
    en: "Average duration of holding a trade.",
    es: "Duración promedio de mantener una operación.",
    de: "Durchschnittliche Haltedauer eines Trades.",
    it: "Durata media di mantenimento di un trade.",
    pt: "Duração média de manter uma operação.",
    ar: "متوسط مدة الاحتفاظ بالصفقة.",
    tr: "Bir işlemi tutma süresi ortalaması."
  },
  totalTimeInPosition: {
    fr: "Temps cumulé passé en position sur tous les trades.",
    en: "Cumulative time spent in position on all trades.",
    es: "Tiempo acumulado en posición en todas las operaciones.",
    de: "Kumulierte Zeit in Position über alle Trades.",
    it: "Tempo cumulativo trascorso in posizione su tutti i trade.",
    pt: "Tempo acumulado em posição em todas as operações.",
    ar: "الوقت الإجمالي في الصفقات.",
    tr: "Tüm işlemlerde pozisyonda geçirilen toplam süre."
  },
  tradesPerDay: {
    fr: "Moyenne du nombre de trades quotidiens.",
    en: "Average number of daily trades.",
    es: "Promedio de operaciones diarias.",
    de: "Durchschnittliche Anzahl täglicher Trades.",
    it: "Numero medio di trade giornalieri.",
    pt: "Número médio de operações diárias.",
    ar: "متوسط عدد الصفقات اليومية.",
    tr: "Günlük ortalama işlem sayısı."
  },
};

// === SÉRIES & RISQUE ===
export const streaksTooltips: Record<string, MultilingualTooltip> = {
  maxWinStreak: {
    fr: "Plus longue série de trades gagnants consécutifs.",
    en: "Longest streak of consecutive winning trades.",
    es: "Racha más larga de operaciones ganadoras consecutivas.",
    de: "Längste Serie aufeinanderfolgender Gewinn-Trades.",
    it: "Serie più lunga di trade vincenti consecutivi.",
    pt: "Maior sequência de operações vencedoras consecutivas.",
    ar: "أطول سلسلة صفقات رابحة متتالية.",
    tr: "Art arda kazanan işlemlerin en uzun serisi."
  },
  maxLossStreak: {
    fr: "Plus longue série de trades perdants consécutifs.",
    en: "Longest streak of consecutive losing trades.",
    es: "Racha más larga de operaciones perdedoras consecutivas.",
    de: "Längste Serie aufeinanderfolgender Verlust-Trades.",
    it: "Serie più lunga di trade perdenti consecutivi.",
    pt: "Maior sequência de operações perdedoras consecutivas.",
    ar: "أطول سلسلة صفقات خاسرة متتالية.",
    tr: "Art arda kaybeden işlemlerin en uzun serisi."
  },
  currentStreak: {
    fr: "Série actuelle de trades (gagnants ou perdants).",
    en: "Current streak of trades (winning or losing).",
    es: "Racha actual de operaciones (ganadoras o perdedoras).",
    de: "Aktuelle Trade-Serie (Gewinne oder Verluste).",
    it: "Serie attuale di trade (vincenti o perdenti).",
    pt: "Sequência atual de operações (vencedoras ou perdedoras).",
    ar: "السلسلة الحالية من الصفقات (رابحة أو خاسرة).",
    tr: "Mevcut işlem serisi (kazanan veya kaybeden)."
  },
};

// === ANALYSE PSYCHOLOGIQUE ===
export const psychologyTooltips: Record<string, MultilingualTooltip> = {
  emotionalState: {
    fr: "Ressenti du trader avant, pendant ou après le trade.",
    en: "Trader's feelings before, during, or after the trade.",
    es: "Sentimiento del trader antes, durante o después de la operación.",
    de: "Gefühle des Traders vor, während oder nach dem Trade.",
    it: "Sensazioni del trader prima, durante o dopo il trade.",
    pt: "Sentimentos do trader antes, durante ou depois da operação.",
    ar: "مشاعر المتداول قبل أو أثناء أو بعد الصفقة.",
    tr: "Yatırımcının işlem öncesi, sırası veya sonrasındaki duyguları."
  },
  discipline: {
    fr: "Score basé sur le respect de votre plan de trading (risque, stop loss, stratégie, émotion).",
    en: "Score based on adherence to your trading plan (risk, stop loss, strategy, emotion).",
    es: "Puntuación basada en el cumplimiento de su plan de trading (riesgo, stop loss, estrategia, emoción).",
    de: "Punktzahl basierend auf der Einhaltung Ihres Handelsplans (Risiko, Stop-Loss, Strategie, Emotion).",
    it: "Punteggio basato sul rispetto del piano di trading (rischio, stop loss, strategia, emozione).",
    pt: "Pontuação baseada na adesão ao seu plano de trading (risco, stop loss, estratégia, emoção).",
    ar: "درجة مبنية على الالتزام بخطة التداول (المخاطرة، وقف الخسارة، الاستراتيجية، العاطفة).",
    tr: "İşlem planınıza uyum puanı (risk, stop loss, strateji, duygu)."
  },
  emotionalError: {
    fr: "Erreur liée au stress, à la peur ou à la cupidité.",
    en: "Error related to stress, fear, or greed.",
    es: "Error relacionado con el estrés, el miedo o la codicia.",
    de: "Fehler im Zusammenhang mit Stress, Angst oder Gier.",
    it: "Errore legato allo stress, alla paura o all'avidità.",
    pt: "Erro relacionado ao estresse, medo ou ganância.",
    ar: "خطأ مرتبط بالتوتر أو الخوف أو الطمع.",
    tr: "Stres, korku veya açgözlülükle ilgili hata."
  },
  confidence: {
    fr: "Niveau de confiance ressenti lors de la prise de position.",
    en: "Level of confidence felt when taking the position.",
    es: "Nivel de confianza sentido al tomar la posición.",
    de: "Vertrauensniveau beim Eingehen der Position.",
    it: "Livello di fiducia percepito durante l'apertura della posizione.",
    pt: "Nível de confiança sentido ao abrir a posição.",
    ar: "مستوى الثقة المحسوس عند فتح الصفقة.",
    tr: "Pozisyon alırken hissedilen güven seviyesi."
  },
  psychScore: {
    fr: "Indicateur global de votre état mental en trading (confiance, gestion des émotions, régularité).",
    en: "Global indicator of your trading mental state (confidence, emotion management, consistency).",
    es: "Indicador global de su estado mental en trading (confianza, gestión de emociones, regularidad).",
    de: "Globaler Indikator für Ihren mentalen Handelszustand (Vertrauen, Emotionsmanagement, Beständigkeit).",
    it: "Indicatore globale del tuo stato mentale nel trading (fiducia, gestione delle emozioni, regolarità).",
    pt: "Indicador global do seu estado mental em trading (confiança, gestão de emoções, regularidade).",
    ar: "مؤشر شامل لحالتك النفسية في التداول (الثقة، إدارة العواطف، الانتظام).",
    tr: "İşlem mental durumunuzun genel göstergesi (güven, duygu yönetimi, tutarlılık)."
  },
  selfSabotage: {
    fr: "Comportements autodestructeurs détectés (FOMO, revenge trading, overtrading).",
    en: "Self-destructive behaviors detected (FOMO, revenge trading, overtrading).",
    es: "Comportamientos autodestructivos detectados (FOMO, revenge trading, overtrading).",
    de: "Erkannte selbstzerstörerische Verhaltensweisen (FOMO, Revenge Trading, Overtrading).",
    it: "Comportamenti autodistruttivi rilevati (FOMO, revenge trading, overtrading).",
    pt: "Comportamentos autodestrutivos detectados (FOMO, revenge trading, overtrading).",
    ar: "سلوكيات تخريب ذاتي مكتشفة (FOMO، تداول انتقامي، إفراط في التداول).",
    tr: "Tespit edilen kendine zarar verici davranışlar (FOMO, intikam ticareti, aşırı işlem)."
  },
};

// === CALCULATRICES & GESTION DU RISQUE ===
export const calculatorTooltips: Record<string, MultilingualTooltip> = {
  capital: {
    fr: "Solde total du compte de trading.",
    en: "Total balance of the trading account.",
    es: "Saldo total de la cuenta de trading.",
    de: "Gesamtguthaben des Handelskontos.",
    it: "Saldo totale del conto di trading.",
    pt: "Saldo total da conta de trading.",
    ar: "الرصيد الإجمالي لحساب التداول.",
    tr: "İşlem hesabının toplam bakiyesi."
  },
  riskPerTrade: {
    fr: "Montant maximum accepté en perte sur un trade.",
    en: "Maximum amount accepted as loss on a trade.",
    es: "Monto máximo aceptado como pérdida en una operación.",
    de: "Maximal akzeptierter Verlustbetrag bei einem Trade.",
    it: "Importo massimo accettato come perdita su un trade.",
    pt: "Valor máximo aceito como perda em uma operação.",
    ar: "الحد الأقصى للخسارة المقبولة في صفقة.",
    tr: "Bir işlemde kabul edilen maksimum kayıp miktarı."
  },
  riskPercent: {
    fr: "Pourcentage du capital risqué par trade. Recommandé : 1-2%",
    en: "Percentage of capital risked per trade. Recommended: 1-2%",
    es: "Porcentaje del capital arriesgado por operación. Recomendado: 1-2%",
    de: "Prozentsatz des riskierten Kapitals pro Trade. Empfohlen: 1-2%",
    it: "Percentuale del capitale rischiato per trade. Raccomandato: 1-2%",
    pt: "Porcentagem do capital arriscado por operação. Recomendado: 1-2%",
    ar: "نسبة رأس المال المخاطر به لكل صفقة. الموصى به: 1-2%",
    tr: "İşlem başına riske edilen sermaye yüzdesi. Önerilen: %1-2"
  },
  pipValue: {
    fr: "Valeur financière d'un pip pour l'instrument sélectionné.",
    en: "Financial value of a pip for the selected instrument.",
    es: "Valor financiero de un pip para el instrumento seleccionado.",
    de: "Finanzieller Wert eines Pips für das ausgewählte Instrument.",
    it: "Valore finanziario di un pip per lo strumento selezionato.",
    pt: "Valor financeiro de um pip para o instrumento selecionado.",
    ar: "القيمة المالية للنقطة للأداة المختارة.",
    tr: "Seçilen enstrüman için bir pip'in mali değeri."
  },
  positionSize: {
    fr: "Volume optimal calculé selon le risque défini.",
    en: "Optimal volume calculated according to the defined risk.",
    es: "Volumen óptimo calculado según el riesgo definido.",
    de: "Optimales Volumen berechnet nach dem definierten Risiko.",
    it: "Volume ottimale calcolato in base al rischio definito.",
    pt: "Volume ótimo calculado de acordo com o risco definido.",
    ar: "الحجم الأمثل المحسوب وفقاً للمخاطر المحددة.",
    tr: "Tanımlanan riske göre hesaplanan optimal hacim."
  },
  slPips: {
    fr: "Distance du Stop Loss en pips.",
    en: "Stop Loss distance in pips.",
    es: "Distancia del Stop Loss en pips.",
    de: "Stop-Loss-Entfernung in Pips.",
    it: "Distanza dello Stop Loss in pips.",
    pt: "Distância do Stop Loss em pips.",
    ar: "مسافة وقف الخسارة بالنقاط.",
    tr: "Pip cinsinden Stop Loss mesafesi."
  },
  tpPips: {
    fr: "Distance du Take Profit en pips.",
    en: "Take Profit distance in pips.",
    es: "Distancia del Take Profit en pips.",
    de: "Take-Profit-Entfernung in Pips.",
    it: "Distanza del Take Profit in pips.",
    pt: "Distância do Take Profit em pips.",
    ar: "مسافة جني الأرباح بالنقاط.",
    tr: "Pip cinsinden Take Profit mesafesi."
  },
  slValue: {
    fr: "Valeur monétaire de la perte si le SL est touché.",
    en: "Monetary value of loss if SL is hit.",
    es: "Valor monetario de la pérdida si se toca el SL.",
    de: "Geldwert des Verlustes, wenn der SL erreicht wird.",
    it: "Valore monetario della perdita se viene raggiunto lo SL.",
    pt: "Valor monetário da perda se o SL for atingido.",
    ar: "القيمة المالية للخسارة إذا تم الوصول لوقف الخسارة.",
    tr: "SL'ye ulaşılırsa kaybın parasal değeri."
  },
  tpValue: {
    fr: "Valeur monétaire du gain si le TP est touché.",
    en: "Monetary value of gain if TP is hit.",
    es: "Valor monetario de la ganancia si se toca el TP.",
    de: "Geldwert des Gewinns, wenn der TP erreicht wird.",
    it: "Valore monetario del guadagno se viene raggiunto il TP.",
    pt: "Valor monetário do ganho se o TP for atingido.",
    ar: "القيمة المالية للربح إذا تم الوصول لجني الأرباح.",
    tr: "TP'ye ulaşılırsa kazancın parasal değeri."
  },
  asset: {
    fr: "Instrument financier sélectionné pour le calcul.",
    en: "Financial instrument selected for calculation.",
    es: "Instrumento financiero seleccionado para el cálculo.",
    de: "Für die Berechnung ausgewähltes Finanzinstrument.",
    it: "Strumento finanziario selezionato per il calcolo.",
    pt: "Instrumento financeiro selecionado para cálculo.",
    ar: "الأداة المالية المختارة للحساب.",
    tr: "Hesaplama için seçilen finansal enstrüman."
  },
};

// === RAPPORTS ===
export const reportsTooltips: Record<string, MultilingualTooltip> = {
  pnlTotal: {
    fr: "Résultat financier total de tous les trades clôturés sur la période sélectionnée.",
    en: "Total financial result of all closed trades over the selected period.",
    es: "Resultado financiero total de todas las operaciones cerradas en el período seleccionado.",
    de: "Gesamtfinanzergebnis aller geschlossenen Trades im ausgewählten Zeitraum.",
    it: "Risultato finanziario totale di tutti i trade chiusi nel periodo selezionato.",
    pt: "Resultado financeiro total de todas as operações fechadas no período selecionado.",
    ar: "النتيجة المالية الإجمالية لجميع الصفقات المغلقة في الفترة المختارة.",
    tr: "Seçilen dönemdeki tüm kapalı işlemlerin toplam mali sonucu."
  },
  profitNet: {
    fr: "Gain réel après déduction de toutes les pertes. Un profit net positif indique une performance globale rentable.",
    en: "Actual profit after deducting all losses. A positive net profit indicates overall profitable performance.",
    es: "Ganancia real después de deducir todas las pérdidas. Un beneficio neto positivo indica un rendimiento global rentable.",
    de: "Tatsächlicher Gewinn nach Abzug aller Verluste. Ein positiver Nettogewinn zeigt eine insgesamt profitable Performance.",
    it: "Profitto reale dopo aver dedotto tutte le perdite. Un profitto netto positivo indica una performance complessivamente redditizia.",
    pt: "Lucro real após deduzir todas as perdas. Um lucro líquido positivo indica desempenho geral lucrativo.",
    ar: "الربح الفعلي بعد خصم جميع الخسائر. الربح الصافي الإيجابي يشير إلى أداء مربح إجمالاً.",
    tr: "Tüm kayıplar düşüldükten sonraki gerçek kâr. Pozitif net kâr, genel olarak kârlı performansı gösterir."
  },
  disciplineScore: {
    fr: "Score basé sur le respect de votre plan de trading (risque, stop loss, stratégie, émotion).",
    en: "Score based on adherence to your trading plan (risk, stop loss, strategy, emotion).",
    es: "Puntuación basada en el cumplimiento de su plan de trading (riesgo, stop loss, estrategia, emoción).",
    de: "Punktzahl basierend auf der Einhaltung Ihres Handelsplans (Risiko, Stop-Loss, Strategie, Emotion).",
    it: "Punteggio basato sul rispetto del piano di trading (rischio, stop loss, strategia, emozione).",
    pt: "Pontuação baseada na adesão ao seu plano de trading (risco, stop loss, estratégia, emoção).",
    ar: "درجة مبنية على الالتزام بخطة التداول (المخاطرة، وقف الخسارة، الاستراتيجية، العاطفة).",
    tr: "İşlem planınıza uyum puanı (risk, stop loss, strateji, duygu)."
  },
  psychScore: {
    fr: "Indicateur global de votre état mental en trading (confiance, gestion des émotions, régularité).",
    en: "Global indicator of your trading mental state (confidence, emotion management, consistency).",
    es: "Indicador global de su estado mental en trading (confianza, gestión de emociones, regularidad).",
    de: "Globaler Indikator für Ihren mentalen Handelszustand (Vertrauen, Emotionsmanagement, Beständigkeit).",
    it: "Indicatore globale del tuo stato mentale nel trading (fiducia, gestione delle emozioni, regolarità).",
    pt: "Indicador global do seu estado mental em trading (confiança, gestão de emoções, regularidade).",
    ar: "مؤشر شامل لحالتك النفسية في التداول (الثقة، إدارة العواطف، الانتظام).",
    tr: "İşlem mental durumunuzun genel göstergesi (güven, duygu yönetimi, tutarlılık)."
  },
  sessionAnalysis: {
    fr: "Analyse de vos performances par session de trading (Londres, New York, Asie, etc.).",
    en: "Analysis of your performance by trading session (London, New York, Asia, etc.).",
    es: "Análisis de su rendimiento por sesión de trading (Londres, Nueva York, Asia, etc.).",
    de: "Analyse Ihrer Performance nach Handelssession (London, New York, Asien, etc.).",
    it: "Analisi delle tue performance per sessione di trading (Londra, New York, Asia, ecc.).",
    pt: "Análise do seu desempenho por sessão de trading (Londres, Nova York, Ásia, etc.).",
    ar: "تحليل أدائك حسب جلسة التداول (لندن، نيويورك، آسيا، إلخ).",
    tr: "İşlem seansına göre performans analizi (Londra, New York, Asya, vb.)."
  },
  bestSession: {
    fr: "Session de trading avec les meilleurs résultats.",
    en: "Trading session with the best results.",
    es: "Sesión de trading con los mejores resultados.",
    de: "Handelssession mit den besten Ergebnissen.",
    it: "Sessione di trading con i migliori risultati.",
    pt: "Sessão de trading com os melhores resultados.",
    ar: "جلسة التداول ذات أفضل النتائج.",
    tr: "En iyi sonuçlara sahip işlem seansı."
  },
  worstSession: {
    fr: "Session de trading avec les moins bons résultats.",
    en: "Trading session with the worst results.",
    es: "Sesión de trading con los peores resultados.",
    de: "Handelssession mit den schlechtesten Ergebnissen.",
    it: "Sessione di trading con i peggiori risultati.",
    pt: "Sessão de trading com os piores resultados.",
    ar: "جلسة التداول ذات أسوأ النتائج.",
    tr: "En kötü sonuçlara sahip işlem seansı."
  },
  heatmap: {
    fr: "Visualisation des jours et heures les plus performants.",
    en: "Visualization of the most profitable days and hours.",
    es: "Visualización de los días y horas más rentables.",
    de: "Visualisierung der profitabelsten Tage und Stunden.",
    it: "Visualizzazione dei giorni e delle ore più redditizie.",
    pt: "Visualização dos dias e horários mais lucrativos.",
    ar: "تصور أكثر الأيام والساعات ربحية.",
    tr: "En kârlı gün ve saatlerin görselleştirmesi."
  },
  emotionCorrelation: {
    fr: "Analyse du lien entre vos émotions et vos résultats de trading.",
    en: "Analysis of the link between your emotions and trading results.",
    es: "Análisis de la relación entre sus emociones y sus resultados de trading.",
    de: "Analyse der Verbindung zwischen Ihren Emotionen und Handelsergebnissen.",
    it: "Analisi del legame tra le tue emozioni e i risultati di trading.",
    pt: "Análise da relação entre suas emoções e resultados de trading.",
    ar: "تحليل العلاقة بين عواطفك ونتائج التداول.",
    tr: "Duygularınız ile işlem sonuçları arasındaki bağlantının analizi."
  },
  strategyAnalysis: {
    fr: "Performance de chaque stratégie/setup utilisé.",
    en: "Performance of each strategy/setup used.",
    es: "Rendimiento de cada estrategia/configuración utilizada.",
    de: "Performance jeder verwendeten Strategie/Setups.",
    it: "Performance di ogni strategia/setup utilizzato.",
    pt: "Desempenho de cada estratégia/configuração usada.",
    ar: "أداء كل استراتيجية/إعداد مستخدم.",
    tr: "Kullanılan her strateji/kurulumun performansı."
  },
};

// === COMPARAISON DE PÉRIODES ===
export const comparisonTooltips: Record<string, MultilingualTooltip> = {
  periodA: {
    fr: "Première période sélectionnée pour la comparaison.",
    en: "First period selected for comparison.",
    es: "Primer período seleccionado para la comparación.",
    de: "Erster Zeitraum für den Vergleich ausgewählt.",
    it: "Primo periodo selezionato per il confronto.",
    pt: "Primeiro período selecionado para comparação.",
    ar: "الفترة الأولى المختارة للمقارنة.",
    tr: "Karşılaştırma için seçilen ilk dönem."
  },
  periodB: {
    fr: "Deuxième période sélectionnée pour la comparaison.",
    en: "Second period selected for comparison.",
    es: "Segundo período seleccionado para la comparación.",
    de: "Zweiter Zeitraum für den Vergleich ausgewählt.",
    it: "Secondo periodo selezionato per il confronto.",
    pt: "Segundo período selecionado para comparação.",
    ar: "الفترة الثانية المختارة للمقارنة.",
    tr: "Karşılaştırma için seçilen ikinci dönem."
  },
  totalTransactions: {
    fr: "Nombre de trades sur chaque période.",
    en: "Number of trades on each period.",
    es: "Número de operaciones en cada período.",
    de: "Anzahl der Trades in jedem Zeitraum.",
    it: "Numero di trade in ogni periodo.",
    pt: "Número de operações em cada período.",
    ar: "عدد الصفقات في كل فترة.",
    tr: "Her dönemdeki işlem sayısı."
  },
  winrateComparison: {
    fr: "Comparaison du pourcentage de trades gagnants entre les périodes.",
    en: "Comparison of winning trade percentage between periods.",
    es: "Comparación del porcentaje de operaciones ganadoras entre los períodos.",
    de: "Vergleich des Gewinn-Trade-Prozentsatzes zwischen den Zeiträumen.",
    it: "Confronto della percentuale di trade vincenti tra i periodi.",
    pt: "Comparação da porcentagem de operações vencedoras entre os períodos.",
    ar: "مقارنة نسبة الصفقات الرابحة بين الفترات.",
    tr: "Dönemler arasında kazanan işlem yüzdesinin karşılaştırması."
  },
  pnlComparison: {
    fr: "Comparaison du résultat financier entre les périodes sélectionnées.",
    en: "Comparison of financial results between selected periods.",
    es: "Comparación del resultado financiero entre los períodos seleccionados.",
    de: "Vergleich der Finanzergebnisse zwischen den ausgewählten Zeiträumen.",
    it: "Confronto dei risultati finanziari tra i periodi selezionati.",
    pt: "Comparação do resultado financeiro entre os períodos selecionados.",
    ar: "مقارنة النتائج المالية بين الفترات المختارة.",
    tr: "Seçilen dönemler arasında mali sonuçların karşılaştırması."
  },
  disciplineComparison: {
    fr: "Évolution de votre discipline entre deux périodes.",
    en: "Evolution of your discipline between two periods.",
    es: "Evolución de su disciplina entre dos períodos.",
    de: "Entwicklung Ihrer Disziplin zwischen zwei Zeiträumen.",
    it: "Evoluzione della tua disciplina tra due periodi.",
    pt: "Evolução da sua disciplina entre dois períodos.",
    ar: "تطور انضباطك بين فترتين.",
    tr: "İki dönem arasında disiplininizin gelişimi."
  },
  radarPerformance: {
    fr: "Visualisation globale de vos forces et faiblesses en trading.",
    en: "Global visualization of your trading strengths and weaknesses.",
    es: "Visualización global de sus fortalezas y debilidades en trading.",
    de: "Globale Visualisierung Ihrer Handelsstärken und -schwächen.",
    it: "Visualizzazione globale dei tuoi punti di forza e debolezza nel trading.",
    pt: "Visualização global dos seus pontos fortes e fracos em trading.",
    ar: "تصور شامل لنقاط القوة والضعف في التداول.",
    tr: "İşlem güçlü ve zayıf yönlerinizin genel görselleştirmesi."
  },
  summaryComparison: {
    fr: "Synthèse finale des performances entre les deux périodes.",
    en: "Final summary of performance between the two periods.",
    es: "Resumen final del rendimiento entre los dos períodos.",
    de: "Abschließende Zusammenfassung der Performance zwischen den beiden Zeiträumen.",
    it: "Sintesi finale delle performance tra i due periodi.",
    pt: "Resumo final do desempenho entre os dois períodos.",
    ar: "ملخص نهائي للأداء بين الفترتين.",
    tr: "İki dönem arasındaki performansın nihai özeti."
  },
  avgProfit: {
    fr: "Gain moyen par trade gagnant.",
    en: "Average profit per winning trade.",
    es: "Ganancia promedio por operación ganadora.",
    de: "Durchschnittlicher Gewinn pro Gewinn-Trade.",
    it: "Profitto medio per trade vincente.",
    pt: "Lucro médio por operação vencedora.",
    ar: "متوسط الربح لكل صفقة رابحة.",
    tr: "Kazanan işlem başına ortalama kâr."
  },
  avgLoss: {
    fr: "Perte moyenne par trade perdant.",
    en: "Average loss per losing trade.",
    es: "Pérdida promedio por operación perdedora.",
    de: "Durchschnittlicher Verlust pro Verlust-Trade.",
    it: "Perdita media per trade perdente.",
    pt: "Perda média por operação perdedora.",
    ar: "متوسط الخسارة لكل صفقة خاسرة.",
    tr: "Kaybeden işlem başına ortalama kayıp."
  },
};

// === INDICATEURS AVANCÉS ===
export const advancedTooltips: Record<string, MultilingualTooltip> = {
  sharpeRatio: {
    fr: "Mesure du rendement ajusté au risque. Plus il est élevé, meilleur est le rendement par unité de risque.",
    en: "Measure of risk-adjusted return. The higher, the better the return per unit of risk.",
    es: "Medida del rendimiento ajustado al riesgo. Cuanto más alto, mejor el rendimiento por unidad de riesgo.",
    de: "Maß für die risikoadjustierte Rendite. Je höher, desto besser die Rendite pro Risikoeinheit.",
    it: "Misura del rendimento aggiustato per il rischio. Più alto è, migliore è il rendimento per unità di rischio.",
    pt: "Medida do retorno ajustado ao risco. Quanto maior, melhor o retorno por unidade de risco.",
    ar: "مقياس العائد المعدل للمخاطر. كلما ارتفع، كان العائد لكل وحدة مخاطرة أفضل.",
    tr: "Riske göre ayarlanmış getiri ölçüsü. Ne kadar yüksekse, risk birimi başına getiri o kadar iyi."
  },
  netIndex: {
    fr: "Performance globale mesurée en valeur absolue.",
    en: "Overall performance measured in absolute value.",
    es: "Rendimiento global medido en valor absoluto.",
    de: "Gesamtperformance gemessen in absolutem Wert.",
    it: "Performance globale misurata in valore assoluto.",
    pt: "Desempenho geral medido em valor absoluto.",
    ar: "الأداء الإجمالي مقاساً بالقيمة المطلقة.",
    tr: "Mutlak değerde ölçülen genel performans."
  },
  consistency: {
    fr: "Régularité de vos performances au fil du temps.",
    en: "Consistency of your performance over time.",
    es: "Regularidad de su rendimiento a lo largo del tiempo.",
    de: "Beständigkeit Ihrer Performance im Laufe der Zeit.",
    it: "Regolarità delle tue performance nel tempo.",
    pt: "Regularidade do seu desempenho ao longo do tempo.",
    ar: "انتظام أدائك بمرور الوقت.",
    tr: "Zaman içinde performansınızın tutarlılığı."
  },
  riskManagement: {
    fr: "Qualité de votre gestion du risque (respect des SL, taille de position).",
    en: "Quality of your risk management (SL adherence, position sizing).",
    es: "Calidad de su gestión del riesgo (respeto del SL, tamaño de posición).",
    de: "Qualität Ihres Risikomanagements (SL-Einhaltung, Positionsgröße).",
    it: "Qualità della tua gestione del rischio (rispetto dello SL, dimensione della posizione).",
    pt: "Qualidade da sua gestão de risco (adesão ao SL, tamanho da posição).",
    ar: "جودة إدارة المخاطر (الالتزام بوقف الخسارة، حجم الصفقة).",
    tr: "Risk yönetiminizin kalitesi (SL uyumu, pozisyon büyüklüğü)."
  },
  volume: {
    fr: "Nombre de trades exécutés sur la période.",
    en: "Number of trades executed during the period.",
    es: "Número de operaciones ejecutadas durante el período.",
    de: "Anzahl der während des Zeitraums ausgeführten Trades.",
    it: "Numero di trade eseguiti durante il periodo.",
    pt: "Número de operações executadas durante o período.",
    ar: "عدد الصفقات المنفذة خلال الفترة.",
    tr: "Dönem boyunca gerçekleştirilen işlem sayısı."
  },
};

// === JAUGES ===
export const gaugeTooltips: Record<string, MultilingualTooltip> = {
  winrateGauge: {
    fr: "Probabilité moyenne de réussite de vos trades sur la période.",
    en: "Average probability of success of your trades over the period.",
    es: "Probabilidad promedio de éxito de sus operaciones en el período.",
    de: "Durchschnittliche Erfolgswahrscheinlichkeit Ihrer Trades im Zeitraum.",
    it: "Probabilità media di successo dei tuoi trade nel periodo.",
    pt: "Probabilidade média de sucesso das suas operações no período.",
    ar: "متوسط احتمال نجاح صفقاتك خلال الفترة.",
    tr: "Dönem boyunca işlemlerinizin ortalama başarı olasılığı."
  },
  rrGauge: {
    fr: "Ratio risque/rendement moyen réellement obtenu sur vos trades.",
    en: "Average risk/reward ratio actually achieved on your trades.",
    es: "Ratio riesgo/recompensa promedio realmente obtenido en sus operaciones.",
    de: "Durchschnittliches Risiko/Rendite-Verhältnis, das bei Ihren Trades tatsächlich erzielt wurde.",
    it: "Rapporto rischio/rendimento medio effettivamente ottenuto sui tuoi trade.",
    pt: "Relação risco/recompensa média realmente obtida nas suas operações.",
    ar: "متوسط نسبة المخاطرة/العائد المحققة فعلياً في صفقاتك.",
    tr: "İşlemlerinizde gerçekten elde edilen ortalama risk/ödül oranı."
  },
  expectancyGauge: {
    fr: "Gain moyen attendu par trade sur le long terme.",
    en: "Average expected gain per trade over the long term.",
    es: "Ganancia promedio esperada por operación a largo plazo.",
    de: "Erwarteter durchschnittlicher Gewinn pro Trade auf lange Sicht.",
    it: "Guadagno medio atteso per trade nel lungo termine.",
    pt: "Ganho médio esperado por operação a longo prazo.",
    ar: "الربح المتوقع لكل صفقة على المدى الطويل.",
    tr: "Uzun vadede işlem başına beklenen ortalama kazanç."
  },
  profitFactorGauge: {
    fr: "Rapport entre gains totaux et pertes totales. Supérieur à 1.5 = bon, supérieur à 2 = excellent.",
    en: "Ratio of total gains to total losses. Above 1.5 = good, above 2 = excellent.",
    es: "Ratio de ganancias totales sobre pérdidas totales. Superior a 1.5 = bueno, superior a 2 = excelente.",
    de: "Verhältnis von Gesamtgewinnen zu Gesamtverlusten. Über 1.5 = gut, über 2 = ausgezeichnet.",
    it: "Rapporto tra guadagni totali e perdite totali. Superiore a 1.5 = buono, superiore a 2 = eccellente.",
    pt: "Relação entre ganhos totais e perdas totais. Acima de 1.5 = bom, acima de 2 = excelente.",
    ar: "نسبة الأرباح الإجمالية إلى الخسائر الإجمالية. أعلى من 1.5 = جيد، أعلى من 2 = ممتاز.",
    tr: "Toplam kazançların toplam kayıplara oranı. 1.5 üzeri = iyi, 2 üzeri = mükemmel."
  },
  disciplineGauge: {
    fr: "Score de discipline global basé sur le respect de votre plan.",
    en: "Overall discipline score based on adherence to your plan.",
    es: "Puntuación de disciplina global basada en el cumplimiento de su plan.",
    de: "Gesamtdisziplin-Score basierend auf der Einhaltung Ihres Plans.",
    it: "Punteggio di disciplina globale basato sul rispetto del tuo piano.",
    pt: "Pontuação de disciplina global baseada na adesão ao seu plano.",
    ar: "درجة الانضباط الإجمالية بناءً على الالتزام بخطتك.",
    tr: "Planınıza uyuma dayalı genel disiplin puanı."
  },
};

// === CHALLENGES ===
export const challengeTooltips: Record<string, MultilingualTooltip> = {
  currentLevel: {
    fr: "Votre niveau actuel dans le système de progression.",
    en: "Your current level in the progression system.",
    es: "Su nivel actual en el sistema de progresión.",
    de: "Ihr aktuelles Level im Fortschrittssystem.",
    it: "Il tuo livello attuale nel sistema di progressione.",
    pt: "Seu nível atual no sistema de progressão.",
    ar: "مستواك الحالي في نظام التقدم.",
    tr: "İlerleme sistemindeki mevcut seviyeniz."
  },
  totalPoints: {
    fr: "Points totaux accumulés via les challenges.",
    en: "Total points accumulated through challenges.",
    es: "Puntos totales acumulados a través de los desafíos.",
    de: "Gesamtpunkte, die durch Herausforderungen gesammelt wurden.",
    it: "Punti totali accumulati tramite le sfide.",
    pt: "Pontos totais acumulados através dos desafios.",
    ar: "إجمالي النقاط المكتسبة عبر التحديات.",
    tr: "Meydan okumalar aracılığıyla biriken toplam puanlar."
  },
  challengeProgress: {
    fr: "Progression vers la complétion du challenge en cours.",
    en: "Progress towards completing the current challenge.",
    es: "Progreso hacia la finalización del desafío actual.",
    de: "Fortschritt zur Abschluss der aktuellen Herausforderung.",
    it: "Progressi verso il completamento della sfida attuale.",
    pt: "Progresso para completar o desafio atual.",
    ar: "التقدم نحو إكمال التحدي الحالي.",
    tr: "Mevcut meydan okumayı tamamlama yolundaki ilerleme."
  },
  reward: {
    fr: "Récompense obtenue à la complétion du challenge.",
    en: "Reward earned upon challenge completion.",
    es: "Recompensa obtenida al completar el desafío.",
    de: "Belohnung, die beim Abschluss der Herausforderung verdient wird.",
    it: "Ricompensa ottenuta al completamento della sfida.",
    pt: "Recompensa obtida ao completar o desafio.",
    ar: "المكافأة المكتسبة عند إكمال التحدي.",
    tr: "Meydan okuma tamamlandığında kazanılan ödül."
  },
  disciplineStreak: {
    fr: "Jours consécutifs de trading discipliné.",
    en: "Consecutive days of disciplined trading.",
    es: "Días consecutivos de trading disciplinado.",
    de: "Aufeinanderfolgende Tage disziplinierten Handelns.",
    it: "Giorni consecutivi di trading disciplinato.",
    pt: "Dias consecutivos de trading disciplinado.",
    ar: "أيام متتالية من التداول المنضبط.",
    tr: "Art arda disiplinli işlem günleri."
  },
  rewardChest: {
    fr: "Coffre de récompense débloqué après une série de jours disciplinés.",
    en: "Reward chest unlocked after a streak of disciplined days.",
    es: "Cofre de recompensa desbloqueado después de una racha de días disciplinados.",
    de: "Belohnungstruhe, die nach einer Serie disziplinierter Tage freigeschaltet wird.",
    it: "Forziere ricompensa sbloccato dopo una serie di giorni disciplinati.",
    pt: "Baú de recompensa desbloqueado após uma sequência de dias disciplinados.",
    ar: "صندوق المكافآت يُفتح بعد سلسلة من الأيام المنضبطة.",
    tr: "Disiplinli günler serisinden sonra açılan ödül sandığı."
  },
};

// === HISTORIQUE ===
export const historyTooltips: Record<string, MultilingualTooltip> = {
  totalGains: {
    fr: "Somme totale de tous les trades gagnants sur la période filtrée.",
    en: "Total sum of all winning trades in the filtered period.",
    es: "Suma total de todas las operaciones ganadoras en el período filtrado.",
    de: "Gesamtsumme aller Gewinn-Trades im gefilterten Zeitraum.",
    it: "Somma totale di tutti i trade vincenti nel periodo filtrato.",
    pt: "Soma total de todas as operações vencedoras no período filtrado.",
    ar: "مجموع جميع الصفقات الرابحة في الفترة المحددة.",
    tr: "Filtrelenen dönemde tüm kazanan işlemlerin toplamı."
  },
  totalLosses: {
    fr: "Somme totale de tous les trades perdants sur la période filtrée.",
    en: "Total sum of all losing trades in the filtered period.",
    es: "Suma total de todas las operaciones perdedoras en el período filtrado.",
    de: "Gesamtsumme aller Verlust-Trades im gefilterten Zeitraum.",
    it: "Somma totale di tutti i trade perdenti nel periodo filtrato.",
    pt: "Soma total de todas as operações perdedoras no período filtrado.",
    ar: "مجموع جميع الصفقات الخاسرة في الفترة المحددة.",
    tr: "Filtrelenen dönemde tüm kaybeden işlemlerin toplamı."
  },
  breakeven: {
    fr: "Trades clôturés sans gain ni perte.",
    en: "Trades closed with no profit or loss.",
    es: "Operaciones cerradas sin ganancia ni pérdida.",
    de: "Trades ohne Gewinn oder Verlust geschlossen.",
    it: "Trade chiusi senza profitto né perdita.",
    pt: "Operações fechadas sem lucro nem perda.",
    ar: "صفقات مغلقة بدون ربح أو خسارة.",
    tr: "Kâr veya zarar olmadan kapanan işlemler."
  },
  periodFilter: {
    fr: "Filtrez les trades par période (jour, semaine, mois, année ou personnalisé).",
    en: "Filter trades by period (day, week, month, year, or custom).",
    es: "Filtre las operaciones por período (día, semana, mes, año o personalizado).",
    de: "Trades nach Zeitraum filtern (Tag, Woche, Monat, Jahr oder benutzerdefiniert).",
    it: "Filtra i trade per periodo (giorno, settimana, mese, anno o personalizzato).",
    pt: "Filtre as operações por período (dia, semana, mês, ano ou personalizado).",
    ar: "تصفية الصفقات حسب الفترة (يوم، أسبوع، شهر، سنة أو مخصص).",
    tr: "İşlemleri döneme göre filtreleyin (gün, hafta, ay, yıl veya özel)."
  },
  directionFilter: {
    fr: "Filtrez par type de position (Long/Buy ou Short/Sell).",
    en: "Filter by position type (Long/Buy or Short/Sell).",
    es: "Filtre por tipo de posición (Long/Buy o Short/Sell).",
    de: "Nach Positionstyp filtern (Long/Buy oder Short/Sell).",
    it: "Filtra per tipo di posizione (Long/Buy o Short/Sell).",
    pt: "Filtre por tipo de posição (Long/Buy ou Short/Sell).",
    ar: "تصفية حسب نوع الصفقة (Long/Buy أو Short/Sell).",
    tr: "Pozisyon türüne göre filtreleyin (Long/Buy veya Short/Sell)."
  },
  resultFilter: {
    fr: "Filtrez par résultat du trade (gain, perte, breakeven).",
    en: "Filter by trade result (win, loss, breakeven).",
    es: "Filtre por resultado de la operación (ganancia, pérdida, breakeven).",
    de: "Nach Trade-Ergebnis filtern (Gewinn, Verlust, Breakeven).",
    it: "Filtra per risultato del trade (vincita, perdita, breakeven).",
    pt: "Filtre por resultado da operação (ganho, perda, breakeven).",
    ar: "تصفية حسب نتيجة الصفقة (ربح، خسارة، تعادل).",
    tr: "İşlem sonucuna göre filtreleyin (kazanç, kayıp, başabaş)."
  },
  assetFilter: {
    fr: "Filtrez par instrument tradé (paire forex, crypto, indice, etc.).",
    en: "Filter by traded instrument (forex pair, crypto, index, etc.).",
    es: "Filtre por instrumento negociado (par forex, cripto, índice, etc.).",
    de: "Nach gehandeltem Instrument filtern (Forex-Paar, Krypto, Index, etc.).",
    it: "Filtra per strumento negoziato (coppia forex, crypto, indice, ecc.).",
    pt: "Filtre por instrumento negociado (par forex, crypto, índice, etc.).",
    ar: "تصفية حسب الأصل المتداول (زوج فوركس، عملة رقمية، مؤشر، إلخ).",
    tr: "İşlem yapılan enstrümana göre filtreleyin (forex çifti, kripto, endeks, vb.)."
  },
  setupFilter: {
    fr: "Filtrez par stratégie ou setup utilisé.",
    en: "Filter by strategy or setup used.",
    es: "Filtre por estrategia o configuración utilizada.",
    de: "Nach verwendeter Strategie oder Setup filtern.",
    it: "Filtra per strategia o setup utilizzato.",
    pt: "Filtre por estratégia ou configuração usada.",
    ar: "تصفية حسب الاستراتيجية أو الإعداد المستخدم.",
    tr: "Kullanılan strateji veya kuruluma göre filtreleyin."
  },
  sortBy: {
    fr: "Triez les trades par date, P&L, actif ou setup.",
    en: "Sort trades by date, P&L, asset, or setup.",
    es: "Ordene las operaciones por fecha, P&L, activo o configuración.",
    de: "Trades nach Datum, P&L, Asset oder Setup sortieren.",
    it: "Ordina i trade per data, P&L, asset o setup.",
    pt: "Ordene as operações por data, P&L, ativo ou configuração.",
    ar: "رتب الصفقات حسب التاريخ، الربح/الخسارة، الأصل أو الإعداد.",
    tr: "İşlemleri tarih, P&L, varlık veya kuruluma göre sıralayın."
  },
  monthlyCalendar: {
    fr: "Calendrier affichant les performances quotidiennes du mois.",
    en: "Calendar showing daily performances for the month.",
    es: "Calendario que muestra el rendimiento diario del mes.",
    de: "Kalender mit täglichen Leistungen des Monats.",
    it: "Calendario che mostra le prestazioni giornaliere del mese.",
    pt: "Calendário mostrando o desempenho diário do mês.",
    ar: "تقويم يعرض الأداء اليومي للشهر.",
    tr: "Ayın günlük performanslarını gösteren takvim."
  },
};

// === JOURNAL ===
export const journalTooltips: Record<string, MultilingualTooltip> = {
  dailyObjective: {
    fr: "Objectif que vous vous êtes fixé pour la journée.",
    en: "Goal you set for yourself for the day.",
    es: "Objetivo que se ha fijado para el día.",
    de: "Ziel, das Sie sich für den Tag gesetzt haben.",
    it: "Obiettivo che ti sei prefissato per la giornata.",
    pt: "Objetivo que você definiu para o dia.",
    ar: "الهدف الذي حددته لنفسك لهذا اليوم.",
    tr: "Gün için kendinize belirlediğiniz hedef."
  },
  dailyRating: {
    fr: "Note personnelle de votre journée de trading.",
    en: "Personal rating of your trading day.",
    es: "Calificación personal de su día de trading.",
    de: "Persönliche Bewertung Ihres Handelstages.",
    it: "Valutazione personale della tua giornata di trading.",
    pt: "Avaliação pessoal do seu dia de trading.",
    ar: "تقييمك الشخصي ليوم التداول.",
    tr: "İşlem gününüzün kişisel değerlendirmesi."
  },
  lessons: {
    fr: "Leçons apprises et points d'amélioration identifiés.",
    en: "Lessons learned and improvement points identified.",
    es: "Lecciones aprendidas y puntos de mejora identificados.",
    de: "Gelernte Lektionen und identifizierte Verbesserungspunkte.",
    it: "Lezioni apprese e punti di miglioramento identificati.",
    pt: "Lições aprendidas e pontos de melhoria identificados.",
    ar: "الدروس المستفادة ونقاط التحسين المحددة.",
    tr: "Öğrenilen dersler ve belirlenen gelişim noktaları."
  },
  checklist: {
    fr: "Liste des points à vérifier avant de trader.",
    en: "List of points to check before trading.",
    es: "Lista de puntos a verificar antes de operar.",
    de: "Liste der Punkte, die vor dem Handeln zu überprüfen sind.",
    it: "Lista dei punti da verificare prima di fare trading.",
    pt: "Lista de pontos a verificar antes de operar.",
    ar: "قائمة النقاط للتحقق منها قبل التداول.",
    tr: "İşlem yapmadan önce kontrol edilecek noktaların listesi."
  },
  mistakes: {
    fr: "Erreurs commises à éviter à l'avenir.",
    en: "Mistakes made to avoid in the future.",
    es: "Errores cometidos a evitar en el futuro.",
    de: "Gemachte Fehler, die in Zukunft vermieden werden sollten.",
    it: "Errori commessi da evitare in futuro.",
    pt: "Erros cometidos a evitar no futuro.",
    ar: "أخطاء ارتكبت يجب تجنبها مستقبلاً.",
    tr: "Gelecekte kaçınılması gereken yapılan hatalar."
  },
  strengths: {
    fr: "Points forts et bonnes pratiques de la journée.",
    en: "Strengths and best practices of the day.",
    es: "Puntos fuertes y buenas prácticas del día.",
    de: "Stärken und bewährte Praktiken des Tages.",
    it: "Punti di forza e buone pratiche della giornata.",
    pt: "Pontos fortes e boas práticas do dia.",
    ar: "نقاط القوة والممارسات الجيدة لليوم.",
    tr: "Günün güçlü yönleri ve en iyi uygulamaları."
  },
};

// === PARAMÈTRES ===
export const settingsTooltips: Record<string, MultilingualTooltip> = {
  language: {
    fr: "Langue de l'interface de l'application.",
    en: "Application interface language.",
    es: "Idioma de la interfaz de la aplicación.",
    de: "Sprache der Anwendungsoberfläche.",
    it: "Lingua dell'interfaccia dell'applicazione.",
    pt: "Idioma da interface do aplicativo.",
    ar: "لغة واجهة التطبيق.",
    tr: "Uygulama arayüz dili."
  },
  theme: {
    fr: "Thème visuel de l'application (clair ou sombre).",
    en: "Visual theme of the application (light or dark).",
    es: "Tema visual de la aplicación (claro u oscuro).",
    de: "Visuelles Thema der Anwendung (hell oder dunkel).",
    it: "Tema visivo dell'applicazione (chiaro o scuro).",
    pt: "Tema visual do aplicativo (claro ou escuro).",
    ar: "المظهر المرئي للتطبيق (فاتح أو داكن).",
    tr: "Uygulamanın görsel teması (açık veya koyu)."
  },
  primaryColor: {
    fr: "Couleur principale utilisée dans l'interface.",
    en: "Primary color used in the interface.",
    es: "Color principal utilizado en la interfaz.",
    de: "Hauptfarbe, die in der Oberfläche verwendet wird.",
    it: "Colore principale utilizzato nell'interfaccia.",
    pt: "Cor principal usada na interface.",
    ar: "اللون الرئيسي المستخدم في الواجهة.",
    tr: "Arayüzde kullanılan ana renk."
  },
  currency: {
    fr: "Devise utilisée pour afficher les montants.",
    en: "Currency used to display amounts.",
    es: "Moneda utilizada para mostrar los importes.",
    de: "Währung zur Anzeige der Beträge.",
    it: "Valuta utilizzata per visualizzare gli importi.",
    pt: "Moeda usada para exibir os valores.",
    ar: "العملة المستخدمة لعرض المبالغ.",
    tr: "Tutarları göstermek için kullanılan para birimi."
  },
  fontSize: {
    fr: "Taille du texte dans l'interface.",
    en: "Text size in the interface.",
    es: "Tamaño del texto en la interfaz.",
    de: "Textgröße in der Oberfläche.",
    it: "Dimensione del testo nell'interfaccia.",
    pt: "Tamanho do texto na interface.",
    ar: "حجم النص في الواجهة.",
    tr: "Arayüzdeki metin boyutu."
  },
  sounds: {
    fr: "Activer ou désactiver les sons de l'application.",
    en: "Enable or disable application sounds.",
    es: "Activar o desactivar los sonidos de la aplicación.",
    de: "Anwendungsgeräusche aktivieren oder deaktivieren.",
    it: "Attiva o disattiva i suoni dell'applicazione.",
    pt: "Ativar ou desativar os sons do aplicativo.",
    ar: "تفعيل أو تعطيل أصوات التطبيق.",
    tr: "Uygulama seslerini etkinleştirin veya devre dışı bırakın."
  },
  vibration: {
    fr: "Activer ou désactiver la vibration tactile.",
    en: "Enable or disable haptic vibration.",
    es: "Activar o desactivar la vibración háptica.",
    de: "Haptische Vibration aktivieren oder deaktivieren.",
    it: "Attiva o disattiva la vibrazione aptica.",
    pt: "Ativar ou desativar a vibração tátil.",
    ar: "تفعيل أو تعطيل الاهتزاز اللمسي.",
    tr: "Dokunsal titreşimi etkinleştirin veya devre dışı bırakın."
  },
  animations: {
    fr: "Activer ou désactiver les animations de l'interface.",
    en: "Enable or disable interface animations.",
    es: "Activar o desactivar las animaciones de la interfaz.",
    de: "Schnittstellenanimationen aktivieren oder deaktivieren.",
    it: "Attiva o disattiva le animazioni dell'interfaccia.",
    pt: "Ativar ou desativar as animações da interface.",
    ar: "تفعيل أو تعطيل رسوم الواجهة المتحركة.",
    tr: "Arayüz animasyonlarını etkinleştirin veya devre dışı bırakın."
  },
  defaultCapital: {
    fr: "Capital par défaut utilisé dans le calculateur de risque.",
    en: "Default capital used in the risk calculator.",
    es: "Capital predeterminado utilizado en la calculadora de riesgo.",
    de: "Standardkapital im Risikorechner.",
    it: "Capitale predefinito utilizzato nel calcolatore di rischio.",
    pt: "Capital padrão usado na calculadora de risco.",
    ar: "رأس المال الافتراضي المستخدم في حاسبة المخاطر.",
    tr: "Risk hesaplayıcısında kullanılan varsayılan sermaye."
  },
  defaultRiskPercent: {
    fr: "Pourcentage de risque par défaut par trade.",
    en: "Default risk percentage per trade.",
    es: "Porcentaje de riesgo predeterminado por operación.",
    de: "Standard-Risikoprozentsatz pro Trade.",
    it: "Percentuale di rischio predefinita per trade.",
    pt: "Porcentagem de risco padrão por operação.",
    ar: "نسبة المخاطرة الافتراضية لكل صفقة.",
    tr: "İşlem başına varsayılan risk yüzdesi."
  },
  pinSecurity: {
    fr: "Code PIN pour protéger l'accès à l'application.",
    en: "PIN code to protect application access.",
    es: "Código PIN para proteger el acceso a la aplicación.",
    de: "PIN-Code zum Schutz des Anwendungszugriffs.",
    it: "Codice PIN per proteggere l'accesso all'applicazione.",
    pt: "Código PIN para proteger o acesso ao aplicativo.",
    ar: "رمز PIN لحماية الوصول إلى التطبيق.",
    tr: "Uygulama erişimini korumak için PIN kodu."
  },
  confidentialMode: {
    fr: "Masquer les montants sensibles dans l'interface.",
    en: "Hide sensitive amounts in the interface.",
    es: "Ocultar los importes sensibles en la interfaz.",
    de: "Sensible Beträge in der Oberfläche ausblenden.",
    it: "Nascondi gli importi sensibili nell'interfaccia.",
    pt: "Ocultar valores sensíveis na interface.",
    ar: "إخفاء المبالغ الحساسة في الواجهة.",
    tr: "Arayüzde hassas tutarları gizleyin."
  },
  focusMode: {
    fr: "Mode de concentration pour suivre votre plan de trading sans distractions.",
    en: "Focus mode to follow your trading plan without distractions.",
    es: "Modo de enfoque para seguir su plan de trading sin distracciones.",
    de: "Fokus-Modus, um Ihrem Handelsplan ohne Ablenkungen zu folgen.",
    it: "Modalità focus per seguire il tuo piano di trading senza distrazioni.",
    pt: "Modo de foco para seguir seu plano de trading sem distrações.",
    ar: "وضع التركيز لاتباع خطة التداول بدون تشتت.",
    tr: "Dikkat dağıtmadan işlem planınızı takip etmek için odak modu."
  },
};

// === PROFIL ===
export const profileTooltips: Record<string, MultilingualTooltip> = {
  nickname: {
    fr: "Votre nom d'affichage dans l'application.",
    en: "Your display name in the application.",
    es: "Su nombre para mostrar en la aplicación.",
    de: "Ihr Anzeigename in der Anwendung.",
    it: "Il tuo nome visualizzato nell'applicazione.",
    pt: "Seu nome de exibição no aplicativo.",
    ar: "اسم العرض الخاص بك في التطبيق.",
    tr: "Uygulamadaki görünen adınız."
  },
  level: {
    fr: "Votre niveau actuel dans le système de progression.",
    en: "Your current level in the progression system.",
    es: "Su nivel actual en el sistema de progresión.",
    de: "Ihr aktuelles Level im Fortschrittssystem.",
    it: "Il tuo livello attuale nel sistema di progressione.",
    pt: "Seu nível atual no sistema de progressão.",
    ar: "مستواك الحالي في نظام التقدم.",
    tr: "İlerleme sistemindeki mevcut seviyeniz."
  },
  tradingStyle: {
    fr: "Votre style de trading principal (scalping, day trading, swing, position).",
    en: "Your main trading style (scalping, day trading, swing, position).",
    es: "Su estilo de trading principal (scalping, day trading, swing, posición).",
    de: "Ihr Haupt-Handelsstil (Scalping, Daytrading, Swing, Position).",
    it: "Il tuo stile di trading principale (scalping, day trading, swing, position).",
    pt: "Seu estilo de trading principal (scalping, day trading, swing, posição).",
    ar: "أسلوب التداول الرئيسي الخاص بك (سكالبينج، تداول يومي، سوينج، بوزيشن).",
    tr: "Ana işlem tarzınız (scalping, günlük, swing, pozisyon)."
  },
  exportData: {
    fr: "Télécharger toutes vos données de trading au format souhaité.",
    en: "Download all your trading data in the desired format.",
    es: "Descargue todos sus datos de trading en el formato deseado.",
    de: "Laden Sie alle Ihre Handelsdaten im gewünschten Format herunter.",
    it: "Scarica tutti i tuoi dati di trading nel formato desiderato.",
    pt: "Baixe todos os seus dados de trading no formato desejado.",
    ar: "تحميل جميع بيانات التداول الخاصة بك بالتنسيق المطلوب.",
    tr: "Tüm işlem verilerinizi istenen formatta indirin."
  },
  deleteData: {
    fr: "Supprimer définitivement toutes vos données de trading.",
    en: "Permanently delete all your trading data.",
    es: "Eliminar permanentemente todos sus datos de trading.",
    de: "Alle Ihre Handelsdaten dauerhaft löschen.",
    it: "Elimina definitivamente tutti i tuoi dati di trading.",
    pt: "Excluir permanentemente todos os seus dados de trading.",
    ar: "حذف جميع بيانات التداول الخاصة بك نهائياً.",
    tr: "Tüm işlem verilerinizi kalıcı olarak silin."
  },
  deleteAccount: {
    fr: "Supprimer définitivement votre compte et toutes les données associées.",
    en: "Permanently delete your account and all associated data.",
    es: "Eliminar permanentemente su cuenta y todos los datos asociados.",
    de: "Ihr Konto und alle zugehörigen Daten dauerhaft löschen.",
    it: "Elimina definitivamente il tuo account e tutti i dati associati.",
    pt: "Excluir permanentemente sua conta e todos os dados associados.",
    ar: "حذف حسابك وجميع البيانات المرتبطة به نهائياً.",
    tr: "Hesabınızı ve tüm ilişkili verileri kalıcı olarak silin."
  },
};

// Helper function to get tooltip by key and language
export const getTooltip = (category: string, key: string, language: SupportedLanguage = 'fr'): string => {
  const tooltipCategories: Record<string, Record<string, MultilingualTooltip>> = {
    tradeForm: tradeFormTooltips,
    mainStats: mainStatsTooltips,
    time: timeTooltips,
    streaks: streaksTooltips,
    psychology: psychologyTooltips,
    calculator: calculatorTooltips,
    reports: reportsTooltips,
    comparison: comparisonTooltips,
    advanced: advancedTooltips,
    gauge: gaugeTooltips,
    challenge: challengeTooltips,
    history: historyTooltips,
    journal: journalTooltips,
    settings: settingsTooltips,
    profile: profileTooltips,
  };

  const tooltip = tooltipCategories[category]?.[key];
  if (!tooltip) return '';
  
  return tooltip[language] || tooltip.fr || '';
};
