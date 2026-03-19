"""
MedBios AI — Smart Health Recommendations Engine
Generates personalized diet, exercise, supplement, and follow-up recommendations
based on abnormal lab values detected in a patient's report.
"""

RECOMMENDATIONS_DB = {
    # Blood Sugar / Diabetes
    "glucose": {
        "high": {
            "condition": "Elevated Blood Glucose",
            "diet": [
                "Follow a low-glycemic index diet — whole grains, legumes, non-starchy vegetables",
                "Limit refined carbohydrates, white bread, sugary beverages, and fruit juices",
                "Include fiber-rich foods (>25g/day): oats, chia seeds, leafy greens",
                "Consider the Mediterranean diet pattern for optimal glycemic control",
                "Space meals evenly throughout the day — avoid large carb-heavy meals",
            ],
            "exercise": [
                "150 minutes/week of moderate aerobic exercise (brisk walking, cycling, swimming)",
                "Add resistance training 2-3 times/week to improve insulin sensitivity",
                "A 15-minute post-meal walk can significantly lower blood sugar spikes",
            ],
            "supplements": ["Chromium picolinate (200-1000 mcg/day)", "Berberine (500 mg 2x/day)", "Alpha-lipoic acid (300-600 mg/day)"],
            "followup": ["Repeat fasting glucose in 4-6 weeks", "Order HbA1c if not already tested", "Consider oral glucose tolerance test (OGTT)"],
            "urgency": "moderate",
        },
    },
    "hba1c": {
        "high": {
            "condition": "Elevated HbA1c (Pre-diabetes / Diabetes)",
            "diet": [
                "Strict carbohydrate management — aim for 45-60g carbs per meal",
                "Emphasize lean proteins, healthy fats, and high-fiber vegetables",
                "Eliminate sugary drinks and processed snacks entirely",
            ],
            "exercise": ["Combination of aerobic + resistance training at least 5 days/week", "Target 30-60 minutes per session"],
            "supplements": ["Vitamin D (2000-4000 IU/day if deficient)", "Magnesium (200-400 mg/day)"],
            "followup": ["Repeat HbA1c in 3 months", "Comprehensive metabolic panel", "Eye and kidney screening for diabetic complications"],
            "urgency": "high",
        },
    },
    # Cholesterol / Lipids
    "cholesterol": {
        "high": {
            "condition": "Elevated Total Cholesterol",
            "diet": [
                "Increase soluble fiber intake: oats, beans, lentils, psyllium husk",
                "Add plant sterols/stanols (2g/day) from fortified foods",
                "Omega-3 fatty acids: salmon, sardines, walnuts, flaxseeds 2-3x per week",
                "Limit saturated fat to <7% of total calories — reduce red meat, full-fat dairy",
                "Include garlic, green tea, and dark chocolate (70%+) in moderation",
            ],
            "exercise": ["30 minutes of moderate cardio at least 5 days/week", "Brisk walking is highly effective for lipid management"],
            "supplements": ["Omega-3 fish oil (1-4g/day EPA+DHA)", "Red yeast rice (1200 mg/day)", "CoQ10 (100-200 mg/day if on statins)"],
            "followup": ["Repeat lipid panel in 8-12 weeks", "Assess cardiovascular risk factors", "Consider coronary artery calcium score"],
            "urgency": "moderate",
        },
    },
    "ldl": {
        "high": {
            "condition": "Elevated LDL Cholesterol",
            "diet": [
                "Strictly limit saturated and trans fats",
                "Portfolio diet: nuts (almonds), plant sterols, soy protein, viscous fiber",
                "Replace butter with olive oil or avocado oil",
            ],
            "exercise": ["Regular aerobic exercise can lower LDL by 5-10%", "Maintain healthy weight — every 10 lbs lost can reduce LDL by 5-8%"],
            "supplements": ["Plant sterols (2g/day)", "Psyllium fiber (10-12g/day)"],
            "followup": ["Repeat LDL in 6-8 weeks after dietary changes", "If LDL >190: discuss statin therapy with physician"],
            "urgency": "high",
        },
    },
    "hdl": {
        "low": {
            "condition": "Low HDL (Protective Cholesterol)",
            "diet": [
                "Increase monounsaturated fats: olive oil, avocados, almonds",
                "Omega-3 rich fish 2-3 times per week",
                "Moderate alcohol (1 drink/day for women, 2 for men) may raise HDL — discuss with doctor",
                "Eliminate trans fats completely from diet",
            ],
            "exercise": ["Vigorous exercise is most effective — running, cycling, HIIT 3-5x/week", "Each 10 minutes of exercise can increase HDL by 1-3 points"],
            "supplements": ["Niacin (under medical supervision)", "Omega-3 fatty acids (2-4g/day)"],
            "followup": ["Recheck in 3 months", "Assess metabolic syndrome criteria"],
            "urgency": "moderate",
        },
    },
    "triglycerides": {
        "high": {
            "condition": "Elevated Triglycerides",
            "diet": [
                "Drastically reduce sugar, refined carbs, and alcohol",
                "Omega-3 rich foods: fatty fish, walnuts, chia seeds",
                "Limit fructose-containing foods and beverages",
            ],
            "exercise": ["Aerobic exercise 5+ days/week — swimming, cycling, jogging", "Exercise can lower triglycerides by 20-30%"],
            "supplements": ["Omega-3 fish oil (2-4g/day)", "Niacin (500-2000 mg/day under supervision)"],
            "followup": ["Repeat in 6-8 weeks", "Check for secondary causes: thyroid, liver, diabetes"],
            "urgency": "moderate",
        },
    },
    # Iron & Anemia
    "hemoglobin": {
        "low": {
            "condition": "Low Hemoglobin (Anemia)",
            "diet": [
                "Iron-rich foods: red meat, spinach, lentils, fortified cereals, pumpkin seeds",
                "Pair iron-rich foods with vitamin C (citrus, bell peppers) to enhance absorption",
                "Avoid tea/coffee with meals — tannins inhibit iron absorption",
                "Include B12-rich foods: eggs, dairy, fortified nutritional yeast",
            ],
            "exercise": ["Light to moderate exercise — avoid intense training until hemoglobin normalizes", "Walking and yoga are appropriate"],
            "supplements": ["Iron bisglycinate (25-50 mg/day)", "Vitamin C (500 mg with iron supplement)", "Vitamin B12 (1000 mcg/day if B12 is low)", "Folate (400-800 mcg/day)"],
            "followup": ["CBC with reticulocyte count in 4-6 weeks", "Iron studies (ferritin, TIBC, serum iron)", "Screen for GI blood loss if unexplained"],
            "urgency": "high",
        },
    },
    "ferritin": {
        "low": {
            "condition": "Low Ferritin (Iron Stores Depleted)",
            "diet": [
                "Prioritize heme iron sources: liver, beef, oysters, sardines",
                "Plant iron sources with vitamin C: spinach + lemon, lentil salad with tomatoes",
                "Cook in cast iron cookware to increase iron content of food",
            ],
            "exercise": ["Moderate activity only — iron depletion impairs oxygen transport", "Avoid marathon/endurance training until resolved"],
            "supplements": ["Ferrous sulfate or iron bisglycinate 65 mg elemental iron/day", "Take on empty stomach with vitamin C for best absorption"],
            "followup": ["Recheck ferritin in 8-12 weeks", "Investigate cause: menstrual loss, GI assessment, celiac screening"],
            "urgency": "moderate",
        },
    },
    # Kidney
    "creatinine": {
        "high": {
            "condition": "Elevated Creatinine (Kidney Stress)",
            "diet": [
                "Reduce protein intake to 0.6-0.8g/kg body weight if kidney function is declining",
                "Stay well-hydrated: 2-3 liters of water daily (unless fluid-restricted)",
                "Limit sodium to <2000 mg/day to reduce kidney workload",
                "Avoid excessive potassium and phosphorus if eGFR is low",
            ],
            "exercise": ["Regular moderate exercise is kidney-protective", "Avoid creatine supplements or extreme exertion"],
            "supplements": ["Omega-3 fatty acids for anti-inflammatory benefit", "Avoid NSAIDs — they worsen kidney function"],
            "followup": ["Repeat creatinine + eGFR in 2-4 weeks", "24-hour urine protein test", "Nephrology referral if eGFR <45"],
            "urgency": "high",
        },
    },
    # Liver
    "alt": {
        "high": {
            "condition": "Elevated ALT (Liver Enzyme)",
            "diet": [
                "Eliminate alcohol completely",
                "Reduce saturated fats, fried foods, and processed meats",
                "Coffee (2-3 cups/day) has proven liver-protective effects",
                "Cruciferous vegetables: broccoli, cauliflower, Brussels sprouts support detox",
            ],
            "exercise": ["150+ minutes/week of moderate exercise helps reduce fatty liver", "Weight loss of 5-10% can normalize liver enzymes"],
            "supplements": ["Milk thistle (silymarin 140 mg 3x/day)", "NAC (N-acetyl cysteine 600 mg/day)", "Vitamin E (800 IU/day for non-diabetic NASH — discuss with doctor)"],
            "followup": ["Repeat liver panel in 4-6 weeks", "Liver ultrasound if persistently elevated", "Rule out hepatitis B & C"],
            "urgency": "moderate",
        },
    },
    # Thyroid
    "tsh": {
        "high": {
            "condition": "Elevated TSH (Hypothyroidism)",
            "diet": [
                "Ensure adequate iodine: seafood, iodized salt, dairy",
                "Selenium-rich foods: Brazil nuts (2-3/day), sunflower seeds, eggs",
                "Avoid excessive raw cruciferous vegetables (goitrogens) in large amounts",
                "Take thyroid medication on empty stomach, 30-60 min before breakfast",
            ],
            "exercise": ["Regular exercise combats hypothyroid fatigue and weight gain", "Start slow and build up — 20 min walks, then progress"],
            "supplements": ["Selenium (200 mcg/day)", "Zinc (15-30 mg/day)", "Vitamin D (check levels — hypothyroid patients are often deficient)"],
            "followup": ["Repeat TSH + free T4 in 6-8 weeks", "Thyroid antibodies (TPO, TgAb) if not tested", "Annual monitoring once stable"],
            "urgency": "moderate",
        },
    },
    # Vitamin D
    "vitamin d": {
        "low": {
            "condition": "Vitamin D Deficiency",
            "diet": [
                "Fatty fish (salmon, mackerel, sardines) 2-3x/week",
                "Egg yolks, fortified milk, fortified cereals",
                "15-20 minutes of sunlight exposure daily (arms and face)",
            ],
            "exercise": ["Outdoor exercise combines sunlight with physical activity", "Weight-bearing exercise helps vitamin D improve bone density"],
            "supplements": ["Vitamin D3 (2000-5000 IU/day depending on severity)", "Vitamin K2 (100 mcg/day) to ensure calcium goes to bones, not arteries", "Magnesium (200-400 mg/day) — required for vitamin D metabolism"],
            "followup": ["Recheck 25(OH)D level in 8-12 weeks", "Calcium and PTH levels", "Bone density scan if persistently low"],
            "urgency": "low",
        },
    },
    # Potassium
    "potassium": {
        "high": {
            "condition": "Hyperkalemia (High Potassium)",
            "diet": [
                "Limit high-potassium foods: bananas, oranges, potatoes, tomatoes, avocados",
                "Leach vegetables by soaking in water before cooking",
                "Avoid salt substitutes (contain potassium chloride)",
            ],
            "exercise": ["Gentle exercise — avoid intense exertion which releases muscle potassium"],
            "supplements": ["Avoid potassium supplements and multivitamins containing potassium"],
            "followup": ["URGENT: Repeat potassium immediately if >5.5", "ECG to check cardiac effects", "Review medications: ACE inhibitors, ARBs, spironolactone"],
            "urgency": "high",
        },
    },
    # CRP / Inflammation
    "crp": {
        "high": {
            "condition": "Elevated CRP (Systemic Inflammation)",
            "diet": [
                "Anti-inflammatory diet: Mediterranean pattern, turmeric, ginger, omega-3s",
                "Eliminate processed foods, refined sugars, and seed oils",
                "Berries, leafy greens, fatty fish, and extra virgin olive oil daily",
            ],
            "exercise": ["Regular moderate exercise reduces CRP by 20-30%", "Avoid overtraining which increases inflammation"],
            "supplements": ["Curcumin/Turmeric (500-1000 mg/day with black pepper)", "Omega-3 (2-4g/day)", "Probiotics for gut-mediated inflammation"],
            "followup": ["Recheck hs-CRP in 6-8 weeks", "Evaluate for underlying causes: infection, autoimmune, cardiovascular risk"],
            "urgency": "moderate",
        },
    },
}


def generate_recommendations(lab_values: list) -> dict:
    """Generate personalized health recommendations based on abnormal lab values."""
    recommendations = []
    seen_conditions = set()

    for lab in lab_values:
        if lab.get("status") in ("normal", None):
            continue

        test_name = (lab.get("test_name") or "").lower()
        status = lab.get("status", "")
        direction = "high" if "high" in status else "low" if "low" in status else None
        if not direction:
            continue

        # Match against DB
        for key, directions in RECOMMENDATIONS_DB.items():
            if key in test_name and direction in directions:
                rec = directions[direction]
                if rec["condition"] not in seen_conditions:
                    seen_conditions.add(rec["condition"])
                    recommendations.append({
                        "test": lab.get("test_name"),
                        "value": f"{lab.get('value')} {lab.get('unit', '')}",
                        "status": status,
                        **rec,
                    })

    # Sort by urgency
    urgency_order = {"high": 0, "moderate": 1, "low": 2}
    recommendations.sort(key=lambda r: urgency_order.get(r.get("urgency", "low"), 3))

    return {
        "total_recommendations": len(recommendations),
        "recommendations": recommendations,
        "summary": _generate_summary(recommendations),
    }


def _generate_summary(recs: list) -> str:
    if not recs:
        return "All values are within normal range. Maintain your current healthy lifestyle."

    high_urgency = [r for r in recs if r.get("urgency") == "high"]
    if high_urgency:
        conditions = ", ".join(r["condition"] for r in high_urgency[:3])
        return f"Priority attention needed for: {conditions}. Schedule a follow-up with your physician within 1-2 weeks."

    return f"Found {len(recs)} area(s) for improvement. Implementing dietary and lifestyle changes can significantly improve your health markers over 8-12 weeks."
