"""
MedBios AI — Reference Ranges for Common Lab Tests
Normal ranges + abnormality detection with severity classification.
Expanded to 80+ tests with 100+ aliases for maximum OCR match accuracy.
"""

# Reference ranges: {test_name: (min, max, unit, critical_low, critical_high)}
REFERENCE_RANGES = {
    # ═══ Complete Blood Count (CBC) ═══
    "hemoglobin": {"min": 12.0, "max": 17.5, "unit": "g/dL", "critical_low": 7.0, "critical_high": 20.0, "category": "Hematological"},
    "hematocrit": {"min": 36.0, "max": 50.0, "unit": "%", "critical_low": 20.0, "critical_high": 60.0, "category": "Hematological"},
    "rbc": {"min": 4.0, "max": 6.0, "unit": "M/uL", "critical_low": 2.5, "critical_high": 7.5, "category": "Hematological"},
    "wbc": {"min": 4.0, "max": 11.0, "unit": "K/uL", "critical_low": 2.0, "critical_high": 30.0, "category": "Hematological"},
    "platelets": {"min": 150.0, "max": 400.0, "unit": "K/uL", "critical_low": 50.0, "critical_high": 1000.0, "category": "Hematological"},
    "mcv": {"min": 80.0, "max": 100.0, "unit": "fL", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "mch": {"min": 27.0, "max": 33.0, "unit": "pg", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "mchc": {"min": 32.0, "max": 36.0, "unit": "g/dL", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "rdw": {"min": 11.5, "max": 14.5, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "mpv": {"min": 7.5, "max": 11.5, "unit": "fL", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "reticulocytes": {"min": 0.5, "max": 2.5, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},

    # ═══ WBC Differential ═══
    "neutrophils": {"min": 40.0, "max": 70.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "lymphocytes": {"min": 20.0, "max": 40.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "monocytes": {"min": 2.0, "max": 8.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "eosinophils": {"min": 1.0, "max": 4.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "basophils": {"min": 0.0, "max": 1.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "neutrophils_abs": {"min": 1.5, "max": 8.0, "unit": "K/uL", "critical_low": 0.5, "critical_high": None, "category": "Hematological"},
    "lymphocytes_abs": {"min": 1.0, "max": 4.0, "unit": "K/uL", "critical_low": None, "critical_high": None, "category": "Hematological"},

    # ═══ Metabolic Panel ═══
    "glucose": {"min": 70.0, "max": 100.0, "unit": "mg/dL", "critical_low": 40.0, "critical_high": 400.0, "category": "Endocrine"},
    "fasting_glucose": {"min": 70.0, "max": 100.0, "unit": "mg/dL", "critical_low": 40.0, "critical_high": 400.0, "category": "Endocrine"},
    "hba1c": {"min": 4.0, "max": 5.6, "unit": "%", "critical_low": None, "critical_high": 10.0, "category": "Endocrine"},
    "insulin": {"min": 2.6, "max": 24.9, "unit": "uIU/mL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "bun": {"min": 7.0, "max": 20.0, "unit": "mg/dL", "critical_low": None, "critical_high": 100.0, "category": "Renal"},
    "creatinine": {"min": 0.6, "max": 1.2, "unit": "mg/dL", "critical_low": None, "critical_high": 10.0, "category": "Renal"},
    "egfr": {"min": 90.0, "max": 120.0, "unit": "mL/min", "critical_low": 15.0, "critical_high": None, "category": "Renal"},
    "bun_creatinine_ratio": {"min": 10.0, "max": 20.0, "unit": "", "critical_low": None, "critical_high": None, "category": "Renal"},
    "cystatin_c": {"min": 0.5, "max": 1.0, "unit": "mg/L", "critical_low": None, "critical_high": None, "category": "Renal"},

    # ═══ Electrolytes ═══
    "sodium": {"min": 136.0, "max": 145.0, "unit": "mEq/L", "critical_low": 120.0, "critical_high": 160.0, "category": "Electrolytes"},
    "potassium": {"min": 3.5, "max": 5.0, "unit": "mEq/L", "critical_low": 2.5, "critical_high": 6.5, "category": "Electrolytes"},
    "calcium": {"min": 8.5, "max": 10.5, "unit": "mg/dL", "critical_low": 6.0, "critical_high": 13.0, "category": "Electrolytes"},
    "chloride": {"min": 98.0, "max": 106.0, "unit": "mEq/L", "critical_low": 80.0, "critical_high": 120.0, "category": "Electrolytes"},
    "co2": {"min": 23.0, "max": 29.0, "unit": "mEq/L", "critical_low": 10.0, "critical_high": 40.0, "category": "Electrolytes"},
    "magnesium": {"min": 1.7, "max": 2.2, "unit": "mg/dL", "critical_low": 1.0, "critical_high": 4.0, "category": "Electrolytes"},
    "phosphorus": {"min": 2.5, "max": 4.5, "unit": "mg/dL", "critical_low": 1.0, "critical_high": 9.0, "category": "Electrolytes"},
    "ionized_calcium": {"min": 4.6, "max": 5.3, "unit": "mg/dL", "critical_low": 3.0, "critical_high": 6.5, "category": "Electrolytes"},

    # ═══ Lipid Panel ═══
    "total_cholesterol": {"min": 0.0, "max": 200.0, "unit": "mg/dL", "critical_low": None, "critical_high": 300.0, "category": "Cardiovascular"},
    "ldl": {"min": 0.0, "max": 100.0, "unit": "mg/dL", "critical_low": None, "critical_high": 190.0, "category": "Cardiovascular"},
    "hdl": {"min": 40.0, "max": 100.0, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "triglycerides": {"min": 0.0, "max": 150.0, "unit": "mg/dL", "critical_low": None, "critical_high": 500.0, "category": "Cardiovascular"},
    "vldl": {"min": 5.0, "max": 40.0, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "non_hdl_cholesterol": {"min": 0.0, "max": 130.0, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "ldl_hdl_ratio": {"min": 0.0, "max": 3.5, "unit": "", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "total_chol_hdl_ratio": {"min": 0.0, "max": 5.0, "unit": "", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},

    # ═══ Cardiac Markers ═══
    "troponin_i": {"min": 0.0, "max": 0.04, "unit": "ng/mL", "critical_low": None, "critical_high": 0.4, "category": "Cardiovascular"},
    "bnp": {"min": 0.0, "max": 100.0, "unit": "pg/mL", "critical_low": None, "critical_high": 400.0, "category": "Cardiovascular"},
    "nt_probnp": {"min": 0.0, "max": 125.0, "unit": "pg/mL", "critical_low": None, "critical_high": 900.0, "category": "Cardiovascular"},
    "ck": {"min": 30.0, "max": 200.0, "unit": "U/L", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "ck_mb": {"min": 0.0, "max": 5.0, "unit": "ng/mL", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "homocysteine": {"min": 0.0, "max": 15.0, "unit": "umol/L", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},
    "lp_a": {"min": 0.0, "max": 30.0, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Cardiovascular"},

    # ═══ Iron Studies ═══
    "ferritin": {"min": 12.0, "max": 300.0, "unit": "ng/mL", "critical_low": None, "critical_high": 1000.0, "category": "Hematological"},
    "iron": {"min": 60.0, "max": 170.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "tibc": {"min": 250.0, "max": 370.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None, "category": "Hematological"},
    "transferrin_saturation": {"min": 20.0, "max": 50.0, "unit": "%", "critical_low": None, "critical_high": None, "category": "Hematological"},

    # ═══ Liver Function ═══
    "alt": {"min": 7.0, "max": 56.0, "unit": "U/L", "critical_low": None, "critical_high": 1000.0, "category": "Hepatic"},
    "ast": {"min": 10.0, "max": 40.0, "unit": "U/L", "critical_low": None, "critical_high": 1000.0, "category": "Hepatic"},
    "alp": {"min": 44.0, "max": 147.0, "unit": "U/L", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "bilirubin_total": {"min": 0.1, "max": 1.2, "unit": "mg/dL", "critical_low": None, "critical_high": 15.0, "category": "Hepatic"},
    "bilirubin_direct": {"min": 0.0, "max": 0.3, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "albumin": {"min": 3.4, "max": 5.4, "unit": "g/dL", "critical_low": 1.5, "critical_high": None, "category": "Hepatic"},
    "total_protein": {"min": 6.0, "max": 8.3, "unit": "g/dL", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "ggt": {"min": 9.0, "max": 48.0, "unit": "U/L", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "ldh": {"min": 140.0, "max": 280.0, "unit": "U/L", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "globulin": {"min": 2.0, "max": 3.5, "unit": "g/dL", "critical_low": None, "critical_high": None, "category": "Hepatic"},
    "ag_ratio": {"min": 1.0, "max": 2.5, "unit": "", "critical_low": None, "critical_high": None, "category": "Hepatic"},

    # ═══ Thyroid ═══
    "tsh": {"min": 0.4, "max": 4.0, "unit": "mIU/L", "critical_low": 0.01, "critical_high": 100.0, "category": "Endocrine"},
    "t3": {"min": 80.0, "max": 200.0, "unit": "ng/dL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "t4": {"min": 5.0, "max": 12.0, "unit": "mcg/dL", "critical_low": 2.0, "critical_high": 20.0, "category": "Endocrine"},
    "free_t4": {"min": 0.8, "max": 1.8, "unit": "ng/dL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "free_t3": {"min": 2.3, "max": 4.2, "unit": "pg/mL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "anti_tpo": {"min": 0.0, "max": 34.0, "unit": "IU/mL", "critical_low": None, "critical_high": None, "category": "Endocrine"},

    # ═══ Inflammatory Markers ═══
    "crp": {"min": 0.0, "max": 3.0, "unit": "mg/L", "critical_low": None, "critical_high": 100.0, "category": "Immunology"},
    "hs_crp": {"min": 0.0, "max": 1.0, "unit": "mg/L", "critical_low": None, "critical_high": None, "category": "Immunology"},
    "esr": {"min": 0.0, "max": 20.0, "unit": "mm/hr", "critical_low": None, "critical_high": 100.0, "category": "Immunology"},
    "procalcitonin": {"min": 0.0, "max": 0.1, "unit": "ng/mL", "critical_low": None, "critical_high": 2.0, "category": "Immunology"},
    "interleukin_6": {"min": 0.0, "max": 7.0, "unit": "pg/mL", "critical_low": None, "critical_high": None, "category": "Immunology"},

    # ═══ Vitamins & Minerals ═══
    "vitamin_d": {"min": 30.0, "max": 100.0, "unit": "ng/mL", "critical_low": None, "critical_high": 150.0, "category": "Nutrition"},
    "vitamin_b12": {"min": 200.0, "max": 900.0, "unit": "pg/mL", "critical_low": None, "critical_high": None, "category": "Nutrition"},
    "folate": {"min": 2.7, "max": 17.0, "unit": "ng/mL", "critical_low": None, "critical_high": None, "category": "Nutrition"},
    "vitamin_a": {"min": 20.0, "max": 60.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None, "category": "Nutrition"},
    "zinc": {"min": 60.0, "max": 120.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None, "category": "Nutrition"},
    "selenium": {"min": 70.0, "max": 150.0, "unit": "mcg/L", "critical_low": None, "critical_high": None, "category": "Nutrition"},

    # ═══ Uric Acid & Gout ═══
    "uric_acid": {"min": 3.0, "max": 7.0, "unit": "mg/dL", "critical_low": None, "critical_high": 12.0, "category": "Renal"},

    # ═══ Pancreatic ═══
    "amylase": {"min": 28.0, "max": 100.0, "unit": "U/L", "critical_low": None, "critical_high": 400.0, "category": "Gastrointestinal"},
    "lipase": {"min": 0.0, "max": 60.0, "unit": "U/L", "critical_low": None, "critical_high": 180.0, "category": "Gastrointestinal"},

    # ═══ Coagulation ═══
    "pt": {"min": 11.0, "max": 13.5, "unit": "sec", "critical_low": None, "critical_high": 30.0, "category": "Hematological"},
    "inr": {"min": 0.8, "max": 1.2, "unit": "", "critical_low": None, "critical_high": 5.0, "category": "Hematological"},
    "aptt": {"min": 25.0, "max": 35.0, "unit": "sec", "critical_low": None, "critical_high": 100.0, "category": "Hematological"},
    "fibrinogen": {"min": 200.0, "max": 400.0, "unit": "mg/dL", "critical_low": 100.0, "critical_high": None, "category": "Hematological"},
    "d_dimer": {"min": 0.0, "max": 0.5, "unit": "mg/L", "critical_low": None, "critical_high": None, "category": "Hematological"},

    # ═══ Urinalysis ═══
    "urine_ph": {"min": 4.5, "max": 8.0, "unit": "", "critical_low": None, "critical_high": None, "category": "Renal"},
    "urine_specific_gravity": {"min": 1.005, "max": 1.030, "unit": "", "critical_low": None, "critical_high": None, "category": "Renal"},
    "urine_protein": {"min": 0.0, "max": 0.0, "unit": "mg/dL", "critical_low": None, "critical_high": None, "category": "Renal"},
    "microalbumin": {"min": 0.0, "max": 30.0, "unit": "mg/L", "critical_low": None, "critical_high": None, "category": "Renal"},

    # ═══ Hormones ═══
    "cortisol_am": {"min": 6.0, "max": 23.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "testosterone": {"min": 270.0, "max": 1070.0, "unit": "ng/dL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "estradiol": {"min": 15.0, "max": 350.0, "unit": "pg/mL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
    "psa": {"min": 0.0, "max": 4.0, "unit": "ng/mL", "critical_low": None, "critical_high": 10.0, "category": "Endocrine"},
    "pth": {"min": 15.0, "max": 65.0, "unit": "pg/mL", "critical_low": None, "critical_high": None, "category": "Endocrine"},
}

# ═══ Expanded Aliases — 100+ mappings for OCR accuracy ═══
ALIASES = {
    # CBC
    "hb": "hemoglobin", "hgb": "hemoglobin", "haemoglobin": "hemoglobin", "hb%": "hemoglobin",
    "hct": "hematocrit", "pcv": "hematocrit", "packed cell volume": "hematocrit",
    "red blood cells": "rbc", "red blood cell count": "rbc", "erythrocyte count": "rbc", "erythrocytes": "rbc",
    "white blood cells": "wbc", "white blood cell count": "wbc", "leucocyte count": "wbc", "leukocytes": "wbc", "total wbc": "wbc", "total leucocyte count": "wbc", "tlc": "wbc",
    "plt": "platelets", "platelet count": "platelets", "thrombocytes": "platelets",
    "mean corpuscular volume": "mcv",
    "mean corpuscular hemoglobin": "mch",
    "mean platelet volume": "mpv",
    "red cell distribution width": "rdw", "rdw-cv": "rdw",
    "retic": "reticulocytes", "reticulocyte count": "reticulocytes", "retic count": "reticulocytes",
    # Differential
    "neutrophil": "neutrophils", "neut": "neutrophils", "neutrophil %": "neutrophils", "polymorphs": "neutrophils", "segmented neutrophils": "neutrophils",
    "lymphocyte": "lymphocytes", "lymph": "lymphocytes", "lymphocyte %": "lymphocytes",
    "monocyte": "monocytes", "mono": "monocytes",
    "eosinophil": "eosinophils", "eosino": "eosinophils", "eos": "eosinophils",
    "basophil": "basophils", "baso": "basophils",
    "absolute neutrophil count": "neutrophils_abs", "anc": "neutrophils_abs",
    "absolute lymphocyte count": "lymphocytes_abs", "alc": "lymphocytes_abs",
    # Metabolic
    "bun": "bun", "blood urea nitrogen": "bun", "urea": "bun", "blood urea": "bun", "urea nitrogen": "bun",
    "serum creatinine": "creatinine", "creat": "creatinine", "s. creatinine": "creatinine", "sr creatinine": "creatinine",
    "estimated gfr": "egfr", "glomerular filtration rate": "egfr", "e-gfr": "egfr",
    "fbs": "fasting_glucose", "fasting blood sugar": "fasting_glucose", "fasting blood glucose": "fasting_glucose",
    "blood sugar": "glucose", "random glucose": "glucose", "blood glucose": "glucose", "rbs": "glucose", "random blood sugar": "glucose", "ppbs": "glucose",
    "glycated hemoglobin": "hba1c", "a1c": "hba1c", "glycosylated hemoglobin": "hba1c", "glycated hb": "hba1c", "hb a1c": "hba1c",
    "fasting insulin": "insulin",
    # Electrolytes
    "na": "sodium", "na+": "sodium", "serum sodium": "sodium",
    "k": "potassium", "k+": "potassium", "serum potassium": "potassium",
    "ca": "calcium", "ca2+": "calcium", "serum calcium": "calcium",
    "cl": "chloride",
    "bicarbonate": "co2", "hco3": "co2", "bicarb": "co2",
    "mg": "magnesium", "serum magnesium": "magnesium",
    "phos": "phosphorus", "phosphate": "phosphorus", "serum phosphorus": "phosphorus",
    # Lipids
    "cholesterol": "total_cholesterol", "total chol": "total_cholesterol", "tc": "total_cholesterol", "serum cholesterol": "total_cholesterol", "total cholesterol": "total_cholesterol",
    "ldl cholesterol": "ldl", "ldl-c": "ldl", "low density lipoprotein": "ldl", "ldl c": "ldl",
    "hdl cholesterol": "hdl", "hdl-c": "hdl", "high density lipoprotein": "hdl", "hdl c": "hdl",
    "tg": "triglycerides", "trigs": "triglycerides", "serum triglycerides": "triglycerides",
    "non-hdl cholesterol": "non_hdl_cholesterol", "non hdl": "non_hdl_cholesterol",
    "lipoprotein a": "lp_a", "lp(a)": "lp_a",
    # Cardiac
    "troponin": "troponin_i", "trop i": "troponin_i", "cardiac troponin": "troponin_i", "hs troponin": "troponin_i",
    "brain natriuretic peptide": "bnp", "pro-bnp": "nt_probnp", "nt probnp": "nt_probnp", "nt-probnp": "nt_probnp",
    "creatine kinase": "ck", "cpk": "ck",
    "ck-mb": "ck_mb",
    # Liver
    "sgpt": "alt", "alanine aminotransferase": "alt", "alanine transaminase": "alt", "s.g.p.t": "alt",
    "sgot": "ast", "aspartate aminotransferase": "ast", "aspartate transaminase": "ast", "s.g.o.t": "ast",
    "alkaline phosphatase": "alp", "alk phos": "alp",
    "total bilirubin": "bilirubin_total", "t. bilirubin": "bilirubin_total", "t bilirubin": "bilirubin_total", "s. bilirubin": "bilirubin_total",
    "direct bilirubin": "bilirubin_direct", "d. bilirubin": "bilirubin_direct", "conjugated bilirubin": "bilirubin_direct",
    "gamma gt": "ggt", "gamma glutamyl transferase": "ggt", "gamma-gt": "ggt", "ggtp": "ggt",
    "lactate dehydrogenase": "ldh",
    "a/g ratio": "ag_ratio", "albumin globulin ratio": "ag_ratio",
    # Thyroid
    "thyroid stimulating hormone": "tsh",
    "triiodothyronine": "t3", "total t3": "t3",
    "thyroxine": "t4", "total t4": "t4",
    "ft3": "free_t3", "free triiodothyronine": "free_t3",
    "ft4": "free_t4", "free thyroxine": "free_t4",
    "anti tpo": "anti_tpo", "tpo antibodies": "anti_tpo", "thyroid peroxidase antibodies": "anti_tpo",
    # Inflammatory
    "c-reactive protein": "crp", "c reactive protein": "crp",
    "hs-crp": "hs_crp", "high sensitivity crp": "hs_crp", "highly sensitive crp": "hs_crp",
    "sed rate": "esr", "sedimentation rate": "esr", "erythrocyte sedimentation rate": "esr",
    "pct": "procalcitonin",
    "il-6": "interleukin_6", "il 6": "interleukin_6",
    # Vitamins
    "vit d": "vitamin_d", "25-oh vitamin d": "vitamin_d", "25 hydroxy vitamin d": "vitamin_d", "25(oh)d": "vitamin_d", "vitamin d3": "vitamin_d", "cholecalciferol": "vitamin_d", "25-hydroxyvitamin d": "vitamin_d",
    "vit b12": "vitamin_b12", "cobalamin": "vitamin_b12", "cyanocobalamin": "vitamin_b12",
    "folic acid": "folate", "serum folate": "folate",
    # Iron
    "serum iron": "iron", "s. iron": "iron",
    "total iron binding capacity": "tibc",
    "tsat": "transferrin_saturation", "transferrin sat": "transferrin_saturation",
    # Coagulation
    "prothrombin time": "pt",
    "partial thromboplastin time": "aptt", "activated ptt": "aptt", "ptt": "aptt",
    "d-dimer": "d_dimer",
    # Pancreatic
    "serum amylase": "amylase", "s. amylase": "amylase",
    "serum lipase": "lipase", "s. lipase": "lipase",
    # Urinalysis
    "urine ph": "urine_ph",
    "specific gravity": "urine_specific_gravity",
    "urine albumin": "microalbumin", "urine microalbumin": "microalbumin",
    # Hormones
    "morning cortisol": "cortisol_am", "am cortisol": "cortisol_am", "serum cortisol": "cortisol_am",
    "total testosterone": "testosterone",
    "prostate specific antigen": "psa",
    "parathyroid hormone": "pth", "intact pth": "pth",
}


def normalize_test_name(raw_name: str) -> str:
    """Normalize a test name to its canonical form with fuzzy matching."""
    cleaned = raw_name.strip().lower()
    # Remove common OCR artifacts
    for char in [':', ';', ',', '(', ')', '[', ']', '*', '#']:
        cleaned = cleaned.replace(char, '')
    cleaned = cleaned.strip().replace("_", " ").replace("-", " ")
    cleaned = " ".join(cleaned.split())  # normalize whitespace

    # Direct match against canonical names
    underscore_version = cleaned.replace(" ", "_")
    if underscore_version in REFERENCE_RANGES:
        return underscore_version

    # Exact alias match
    if cleaned in ALIASES:
        return ALIASES[cleaned]

    # Partial match — alias is inside the cleaned name
    for alias, canonical in sorted(ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        if alias in cleaned:
            return canonical

    # Partial match — cleaned name is inside an alias
    for alias, canonical in ALIASES.items():
        if cleaned in alias:
            return canonical

    return underscore_version


def classify_severity(value: float, ref: dict) -> dict:
    """
    Multi-level severity classification with percentage deviation.
    Returns status, severity_score (0-100), and deviation_percent.
    """
    ref_min, ref_max = ref["min"], ref["max"]
    crit_low, crit_high = ref.get("critical_low"), ref.get("critical_high")
    range_size = ref_max - ref_min if ref_max > ref_min else 1

    if crit_low is not None and value <= crit_low:
        deviation = ((ref_min - value) / range_size) * 100
        return {"status": "critical_low", "severity_score": min(100, 80 + deviation * 0.5), "deviation_pct": round(deviation, 1)}
    elif crit_high is not None and value >= crit_high:
        deviation = ((value - ref_max) / range_size) * 100
        return {"status": "critical_high", "severity_score": min(100, 80 + deviation * 0.5), "deviation_pct": round(deviation, 1)}
    elif value < ref_min:
        deviation = ((ref_min - value) / range_size) * 100
        score = min(79, 30 + deviation * 1.5)
        return {"status": "low", "severity_score": round(score), "deviation_pct": round(deviation, 1)}
    elif value > ref_max:
        deviation = ((value - ref_max) / range_size) * 100
        score = min(79, 30 + deviation * 1.5)
        return {"status": "high", "severity_score": round(score), "deviation_pct": round(deviation, 1)}
    else:
        midpoint = (ref_min + ref_max) / 2
        dist_from_mid = abs(value - midpoint) / (range_size / 2)
        return {"status": "normal", "severity_score": 0, "deviation_pct": round(dist_from_mid * 50, 1)}


def detect_abnormals(lab_values: list[dict]) -> list[dict]:
    """
    Detect abnormal lab values with multi-level severity scoring.
    Input:  [{"test_name": "hemoglobin", "value": 8.9, "unit": "g/dL"}, ...]
    Output: Same list with status, severity_score, deviation_pct, reference_min, reference_max, category
    """
    results = []
    for lab in lab_values:
        canonical = normalize_test_name(lab.get("test_name", ""))
        ref = REFERENCE_RANGES.get(canonical)

        entry = {
            **lab,
            "canonical_name": canonical,
            "status": "normal",
            "severity_score": 0,
            "deviation_pct": 0,
            "reference_min": None,
            "reference_max": None,
            "category": None,
        }

        if ref and lab.get("value") is not None:
            entry["reference_min"] = ref["min"]
            entry["reference_max"] = ref["max"]
            entry["expected_unit"] = ref["unit"]
            entry["category"] = ref.get("category")

            severity = classify_severity(lab["value"], ref)
            entry["status"] = severity["status"]
            entry["severity_score"] = severity["severity_score"]
            entry["deviation_pct"] = severity["deviation_pct"]

        results.append(entry)

    return results
