import sys
import json

def zap_to_sarif(zap_json):
    sarif = {
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "OWASP ZAP",
                        "informationUri": "https://www.zaproxy.org/",
                        "rules": []
                    }
                },
                "results": []
            }
        ]
    }
    rule_ids = set()
    for alert in zap_json.get("site", [{}])[0].get("alerts", []):
        rule_id = alert.get("pluginId", "ZAP")
        if rule_id not in rule_ids:
            sarif["runs"][0]["tool"]["driver"]["rules"].append({
                "id": rule_id,
                "name": alert.get("alert", ""),
                "fullDescription": {"text": alert.get("desc", "")},
                "help": {"text": alert.get("solution", "")},
                "defaultConfiguration": {"level": "warning"}
            })
            rule_ids.add(rule_id)
        for instance in alert.get("instances", []):
            sarif["runs"][0]["results"].append({
                "ruleId": rule_id,
                "level": "warning",
                "message": {"text": alert.get("alert", "")},
                "locations": [{
                    "physicalLocation": {
                        "artifactLocation": {"uri": instance.get("uri", "unknown")},
                        "region": {"startLine": 1}
                    }
                }]
            })
    return sarif

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python zap_json_to_sarif.py <input_json> <output_sarif>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        zap_json = json.load(f)
    sarif = zap_to_sarif(zap_json)
    with open(sys.argv[2], "w") as f:
        json.dump(sarif, f, indent=2)