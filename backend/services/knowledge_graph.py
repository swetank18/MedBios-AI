"""
MedBios AI — Medical Knowledge Graph
NetworkX-based knowledge graph encoding medical relationships between
lab tests, symptoms, diseases, medications, and organ systems.
"""
import json
import logging
from pathlib import Path
from typing import Optional

import networkx as nx

logger = logging.getLogger(__name__)

# Singleton graph instance
_graph: Optional[nx.DiGraph] = None


def get_graph() -> nx.DiGraph:
    """Get or initialize the medical knowledge graph."""
    global _graph
    if _graph is None:
        _graph = _build_graph()
    return _graph


def _build_graph() -> nx.DiGraph:
    """Build the medical knowledge graph from seed data."""
    G = nx.DiGraph()

    # Load seed data
    seed_path = Path(__file__).parent.parent / "data" / "medical_graph_seed.json"
    if seed_path.exists():
        try:
            with open(seed_path, "r") as f:
                seed = json.load(f)
            for node in seed.get("nodes", []):
                G.add_node(node["id"], **{k: v for k, v in node.items() if k != "id"})
            for edge in seed.get("edges", []):
                G.add_edge(edge["source"], edge["target"], **{k: v for k, v in edge.items() if k not in ("source", "target")})
            logger.info(f"Loaded knowledge graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
        except Exception as e:
            logger.error(f"Failed to load seed data: {e}")
            _seed_default(G)
    else:
        _seed_default(G)

    return G


def _seed_default(G: nx.DiGraph):
    """Seed graph with hardcoded medical relationships if no seed file exists."""
    # ── LAB TESTS ──
    lab_tests = [
        ("hemoglobin", "lab_test", "Hemoglobin"),
        ("ferritin", "lab_test", "Ferritin"),
        ("mcv", "lab_test", "MCV (Mean Corpuscular Volume)"),
        ("ldl", "lab_test", "LDL Cholesterol"),
        ("hdl", "lab_test", "HDL Cholesterol"),
        ("triglycerides", "lab_test", "Triglycerides"),
        ("creatinine", "lab_test", "Creatinine"),
        ("egfr", "lab_test", "eGFR"),
        ("glucose", "lab_test", "Blood Glucose"),
        ("hba1c", "lab_test", "HbA1c"),
        ("tsh", "lab_test", "TSH"),
        ("alt", "lab_test", "ALT"),
        ("ast", "lab_test", "AST"),
        ("wbc", "lab_test", "White Blood Cell Count"),
        ("platelets", "lab_test", "Platelet Count"),
    ]
    for node_id, node_type, label in lab_tests:
        G.add_node(node_id, type=node_type, label=label)

    # ── DISEASES ──
    diseases = [
        ("iron_deficiency_anemia", "disease", "Iron Deficiency Anemia"),
        ("anemia", "disease", "Anemia"),
        ("atherosclerosis", "disease", "Atherosclerosis"),
        ("cardiovascular_disease", "disease", "Cardiovascular Disease"),
        ("ckd", "disease", "Chronic Kidney Disease"),
        ("diabetes", "disease", "Diabetes Mellitus"),
        ("hypothyroidism", "disease", "Hypothyroidism"),
        ("hyperthyroidism", "disease", "Hyperthyroidism"),
        ("fatty_liver", "disease", "Fatty Liver Disease"),
        ("hepatitis", "disease", "Hepatitis"),
    ]
    for node_id, node_type, label in diseases:
        G.add_node(node_id, type=node_type, label=label)

    # ── SYMPTOMS ──
    symptoms = [
        ("fatigue", "symptom", "Fatigue"),
        ("chest_pain", "symptom", "Chest Pain"),
        ("edema", "symptom", "Edema"),
        ("polyuria", "symptom", "Polyuria"),
        ("weight_gain", "symptom", "Weight Gain"),
        ("weight_loss", "symptom", "Weight Loss"),
    ]
    for node_id, node_type, label in symptoms:
        G.add_node(node_id, type=node_type, label=label)

    # ── EDGES ──
    edges = [
        ("hemoglobin", "anemia", "indicates", "low hemoglobin indicates anemia"),
        ("ferritin", "iron_deficiency_anemia", "indicates", "low ferritin indicates iron deficiency"),
        ("anemia", "iron_deficiency_anemia", "subtype", "iron deficiency is a type of anemia"),
        ("anemia", "fatigue", "causes", "anemia causes fatigue"),
        ("iron_deficiency_anemia", "fatigue", "causes", "iron deficiency anemia causes fatigue"),
        ("ldl", "atherosclerosis", "indicates", "high LDL indicates atherosclerosis risk"),
        ("atherosclerosis", "cardiovascular_disease", "causes", "atherosclerosis leads to CVD"),
        ("cardiovascular_disease", "chest_pain", "causes", "CVD can cause chest pain"),
        ("creatinine", "ckd", "indicates", "high creatinine indicates kidney dysfunction"),
        ("egfr", "ckd", "indicates", "low eGFR indicates CKD"),
        ("ckd", "edema", "causes", "CKD can cause edema"),
        ("ckd", "fatigue", "causes", "CKD can cause fatigue"),
        ("glucose", "diabetes", "indicates", "high glucose indicates diabetes"),
        ("hba1c", "diabetes", "indicates", "high HbA1c indicates diabetes"),
        ("diabetes", "polyuria", "causes", "diabetes causes polyuria"),
        ("diabetes", "ckd", "associated_with", "diabetes is a risk factor for CKD"),
        ("diabetes", "cardiovascular_disease", "associated_with", "diabetes increases CVD risk"),
        ("tsh", "hypothyroidism", "indicates", "high TSH indicates hypothyroidism"),
        ("tsh", "hyperthyroidism", "indicates", "low TSH indicates hyperthyroidism"),
        ("hypothyroidism", "fatigue", "causes", "hypothyroidism causes fatigue"),
        ("hypothyroidism", "weight_gain", "causes", "hypothyroidism causes weight gain"),
        ("hyperthyroidism", "weight_loss", "causes", "hyperthyroidism causes weight loss"),
        ("alt", "fatty_liver", "indicates", "elevated ALT indicates liver damage"),
        ("ast", "hepatitis", "indicates", "elevated AST indicates liver inflammation"),
    ]
    for src, tgt, rel_type, description in edges:
        G.add_edge(src, tgt, relationship=rel_type, description=description)


# ── Public API ──────────────────────────────────────────────────────────────

def query_related(entity: str, max_depth: int = 3) -> list[dict]:
    """
    Find all entities related to a given entity through graph traversal.
    Returns nodes reachable within max_depth hops.
    """
    G = get_graph()
    entity = entity.lower().replace(" ", "_")

    if entity not in G:
        return []

    related = []
    visited = set()

    def _traverse(node, depth, path):
        if depth > max_depth or node in visited:
            return
        visited.add(node)

        for neighbor in G.successors(node):
            edge_data = G.edges[node, neighbor]
            related.append({
                "entity": neighbor,
                "label": G.nodes[neighbor].get("label", neighbor),
                "type": G.nodes[neighbor].get("type", "unknown"),
                "relationship": edge_data.get("relationship", "related"),
                "description": edge_data.get("description", ""),
                "depth": depth,
                "path": path + [neighbor],
            })
            _traverse(neighbor, depth + 1, path + [neighbor])

    _traverse(entity, 1, [entity])
    return related


def infer_downstream_risks(abnormal_labs: list[dict]) -> list[dict]:
    """
    Walk the knowledge graph to find downstream risks from abnormal lab values.
    
    Input: Lab values with 'canonical_name' and 'status' (not 'normal')
    Output: List of inferred risks with reasoning chains
    """
    G = get_graph()
    risks = []
    seen_risks = set()

    for lab in abnormal_labs:
        if lab.get("status", "normal") == "normal":
            continue

        canonical = lab.get("canonical_name", "").lower()
        if canonical not in G:
            continue

        # Walk graph from this lab test
        related = query_related(canonical, max_depth=3)
        for item in related:
            if item["type"] == "disease" and item["entity"] not in seen_risks:
                seen_risks.add(item["entity"])
                risks.append({
                    "risk": item["label"],
                    "triggered_by": lab.get("test_name", canonical),
                    "value": lab.get("value"),
                    "status": lab.get("status"),
                    "relationship_chain": " → ".join(item["path"]),
                    "depth": item["depth"],
                    "confidence": "high" if item["depth"] == 1 else "medium" if item["depth"] == 2 else "low",
                })

    # Sort by depth (direct risks first)
    risks.sort(key=lambda x: x["depth"])
    return risks


def get_subgraph(entities: list[str], depth: int = 2) -> dict:
    """
    Get a serializable subgraph centered on the given entities.
    Used for frontend visualization.
    
    Returns: {"nodes": [...], "edges": [...]}
    """
    G = get_graph()
    relevant_nodes = set()

    for entity in entities:
        entity = entity.lower().replace(" ", "_")
        if entity in G:
            relevant_nodes.add(entity)
            # Add neighbors up to depth
            for d in range(depth):
                new_nodes = set()
                for node in relevant_nodes:
                    new_nodes.update(G.successors(node))
                    new_nodes.update(G.predecessors(node))
                relevant_nodes.update(new_nodes)

    # Build serializable subgraph
    subgraph = G.subgraph(relevant_nodes)

    nodes = []
    for node in subgraph.nodes():
        data = G.nodes[node]
        nodes.append({
            "id": node,
            "label": data.get("label", node),
            "type": data.get("type", "unknown"),
        })

    edges = []
    for src, tgt in subgraph.edges():
        data = G.edges[src, tgt]
        edges.append({
            "source": src,
            "target": tgt,
            "relationship": data.get("relationship", "related"),
            "description": data.get("description", ""),
        })

    return {"nodes": nodes, "edges": edges}


def get_full_graph_stats() -> dict:
    """Return statistics about the knowledge graph."""
    G = get_graph()
    type_counts = {}
    for node in G.nodes():
        t = G.nodes[node].get("type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

    rel_counts = {}
    for _, _, data in G.edges(data=True):
        r = data.get("relationship", "unknown")
        rel_counts[r] = rel_counts.get(r, 0) + 1

    return {
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "node_types": type_counts,
        "relationship_types": rel_counts,
    }
