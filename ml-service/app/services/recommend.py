def roi_ranked_recommendations(payload):
    emissions = payload.emissions or []
    total = sum(float(item.get("tCO2e", 0)) for item in emissions)
    base = max(total, 20)

    candidates = [
        {
            "title": "Install smart LED lighting controls",
            "description": "Prioritize hostels, corridors, libraries, and admin blocks with high evening loads.",
            "estimatedReductionTCO2e": base * 0.16,
            "estimatedCost": 260000,
            "paybackPeriod": 1.3,
        },
        {
            "title": "Solar PPA for daytime academic load",
            "description": "Offset grid electricity without upfront capex through a campus rooftop PPA.",
            "estimatedReductionTCO2e": base * 0.28,
            "estimatedCost": 120000,
            "paybackPeriod": 0.8,
        },
        {
            "title": "Segregated organic waste composting",
            "description": "Reduce landfill methane from hostel and canteen waste using on-campus composting.",
            "estimatedReductionTCO2e": base * 0.09,
            "estimatedCost": 85000,
            "paybackPeriod": 1.1,
        },
        {
            "title": "Bus route occupancy optimization",
            "description": "Consolidate low-occupancy trips and measure diesel use by route.",
            "estimatedReductionTCO2e": base * 0.11,
            "estimatedCost": 60000,
            "paybackPeriod": 0.7,
        },
    ]

    for item in candidates:
        cost_per_tonne = item["estimatedCost"] / max(item["estimatedReductionTCO2e"], 0.1)
        item["priorityScore"] = round(100 / (1 + cost_per_tonne / 100000) + item["estimatedReductionTCO2e"], 2)
        item["estimatedReductionTCO2e"] = round(item["estimatedReductionTCO2e"], 3)

    return sorted(candidates, key=lambda item: item["priorityScore"], reverse=True)
