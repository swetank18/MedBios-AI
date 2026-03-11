"""
MedBios AI — Explainability System
Builds transparent evidence chains linking each clinical insight to its source data.
Every insight shows: Evidence → Reasoning → Source
"""
import logging

logger = logging.getLogger(__name__)


def build_evidence_chains(insights: list[dict], lab_values: list[dict], raw_text: str = "") -> list[dict]:
    """
    Build explainable evidence chains for each clinical insight.
    
    Each chain contains:
    - insight: the clinical interpretation
    - evidence_items: list of supporting lab values
    - reasoning_steps: how the conclusion was reached
    - source_references: original text snippets where values were found
    - confidence_justification: why this confidence level was assigned
    """
    # Build a lookup for lab values by canonical name
    lab_lookup = {}
    for lab in lab_values:
        name = lab.get("canonical_name", lab.get("test_name", "")).lower()
        lab_lookup[name] = lab

    chains = []
    for insight in insights:
        chain = {
            "insight": insight["condition"],
            "confidence": insight.get("confidence", "unknown"),
            "category": insight.get("category", "General"),
            "evidence_items": [],
            "reasoning_steps": [],
            "source_references": [],
            "confidence_justification": "",
            "recommendation": insight.get("recommendation", ""),
        }

        # ── Build evidence items ──
        for ev in insight.get("evidence", []):
            test_name = ev.get("test", "").lower().replace(" ", "_")
            lab = lab_lookup.get(test_name, {})

            evidence_item = {
                "test_name": ev.get("test", "Unknown"),
                "observed_value": ev.get("value"),
                "finding": ev.get("finding", ""),
                "reference_range": None,
                "unit": lab.get("unit") or lab.get("expected_unit", ""),
                "status": lab.get("status", "unknown"),
            }

            # Add reference range
            ref_min = lab.get("reference_min")
            ref_max = lab.get("reference_max")
            if ref_min is not None and ref_max is not None:
                evidence_item["reference_range"] = f"{ref_min} - {ref_max}"

            chain["evidence_items"].append(evidence_item)

        # ── Build reasoning steps ──
        # Step 1: What was observed
        observations = []
        for ev in chain["evidence_items"]:
            observations.append(
                f"{ev['test_name']}: {ev['observed_value']} {ev['unit']} — {ev['finding']}"
            )
        if observations:
            chain["reasoning_steps"].append({
                "step": 1,
                "type": "observation",
                "description": "Abnormal values detected",
                "details": observations,
            })

        # Step 2: Clinical rule applied
        chain["reasoning_steps"].append({
            "step": 2,
            "type": "rule_application",
            "description": "Clinical reasoning rule applied",
            "details": insight.get("reasoning", "Rule-based inference"),
        })

        # Step 3: Conclusion reached
        chain["reasoning_steps"].append({
            "step": 3,
            "type": "conclusion",
            "description": f"Clinical interpretation: {insight['condition']}",
            "details": f"Confidence: {insight.get('confidence', 'unknown').upper()}",
        })

        # ── Source references ──
        for ev in insight.get("evidence", []):
            test_name = ev.get("test", "").lower().replace(" ", "_")
            lab = lab_lookup.get(test_name, {})
            raw = lab.get("raw_text", "")
            if raw:
                chain["source_references"].append({
                    "test": ev.get("test"),
                    "source_text": raw,
                    "extraction_method": "NLP pattern matching",
                })

        # ── Confidence justification ──
        confidence = insight.get("confidence", "low")
        num_evidence = len(chain["evidence_items"])
        if confidence == "high":
            chain["confidence_justification"] = (
                f"HIGH confidence — {num_evidence} supporting lab value(s) with clear diagnostic criteria. "
                "Values meet established clinical thresholds for this condition."
            )
        elif confidence == "medium":
            chain["confidence_justification"] = (
                f"MEDIUM confidence — {num_evidence} supporting lab value(s) with suggestive but not definitive findings. "
                "Additional testing recommended for confirmation."
            )
        else:
            chain["confidence_justification"] = (
                f"LOW confidence — Limited supporting evidence ({num_evidence} value(s)). "
                "Findings are suggestive and warrant clinical correlation."
            )

        chains.append(chain)

    return chains


def format_evidence_summary(chains: list[dict]) -> str:
    """
    Format evidence chains into a human-readable text summary.
    Useful for the report generator.
    """
    if not chains:
        return "No clinical insights generated."

    lines = ["═══ Clinical Evidence Summary ═══", ""]

    for i, chain in enumerate(chains, 1):
        lines.append(f"─── Insight #{i}: {chain['insight']} ───")
        lines.append(f"Confidence: {chain['confidence'].upper()}")
        lines.append(f"Category: {chain['category']}")
        lines.append("")

        # Evidence
        lines.append("  Evidence:")
        for ev in chain["evidence_items"]:
            ref = f" (ref: {ev['reference_range']})" if ev["reference_range"] else ""
            lines.append(f"    • {ev['test_name']}: {ev['observed_value']} {ev['unit']}{ref}")
            lines.append(f"      → {ev['finding']}")

        # Reasoning
        lines.append("")
        lines.append("  Reasoning:")
        for step in chain["reasoning_steps"]:
            lines.append(f"    Step {step['step']} [{step['type']}]: {step['description']}")
            if isinstance(step["details"], list):
                for d in step["details"]:
                    lines.append(f"      - {d}")
            else:
                lines.append(f"      {step['details']}")

        # Source
        if chain["source_references"]:
            lines.append("")
            lines.append("  Source:")
            for src in chain["source_references"]:
                lines.append(f"    \"{src['source_text']}\"")

        lines.append(f"\n  {chain['confidence_justification']}")
        if chain["recommendation"]:
            lines.append(f"  Recommendation: {chain['recommendation']}")
        lines.append("")

    return "\n".join(lines)
