#!/usr/bin/env python3
"""
V.I.B.E. Validation Check
Validates code quality, security patterns, and deployment readiness
Used in CI pipeline to gate deployments with a minimum threshold score

Usage:
    python vibe_check.py --threshold=0.90
"""

import argparse
import json
import sys
from pathlib import Path


def check_typescript_types(src_dir: Path) -> float:
    """Check TypeScript type coverage in adapter files"""
    adapter_files = list((src_dir / 'server' / 'deploy-adapter').glob('*.ts'))
    if not adapter_files:
        return 0.5
    
    typed_exports = 0
    total_exports = 0
    
    for file in adapter_files:
        content = file.read_text()
        # Simple heuristic: count exported functions with type annotations
        exports = content.count('export ')
        typed = content.count(': Promise<') + content.count(': string') + content.count(': number')
        total_exports += exports
        typed_exports += min(typed, exports)
    
    return typed_exports / max(total_exports, 1)


def check_error_handling(src_dir: Path) -> float:
    """Check error handling patterns in client code"""
    client_file = src_dir / 'server' / 'deploy-adapter' / 'client.ts'
    if not client_file.exists():
        return 0.0
    
    content = client_file.read_text()
    
    # Check for try-catch blocks
    try_count = content.count('try {')
    throw_count = content.count('throw new Error')
    
    # Check for Charter/Ledger logging
    charter_logs = content.count('[Charter]')
    ledger_logs = content.count('[Ledger]')
    
    score = 0.0
    if try_count >= 3:
        score += 0.4
    if throw_count >= 2:
        score += 0.3
    if ledger_logs >= 2:
        score += 0.3
    
    return min(score, 1.0)


def check_security_patterns(src_dir: Path) -> float:
    """Check security best practices"""
    issues = []
    score = 1.0
    
    # Check for hardcoded secrets (simple pattern matching)
    for file in src_dir.rglob('*.ts'):
        if 'node_modules' in str(file) or 'build' in str(file):
            continue
        
        content = file.read_text()
        if 'password' in content.lower() and '=' in content:
            issues.append(f"Potential hardcoded credential in {file}")
            score -= 0.2
        
        if 'api_key' in content.lower() and '=' in content and 'process.env' not in content:
            issues.append(f"Hardcoded API key in {file}")
            score -= 0.3
    
    # Check for env var usage in client
    client_file = src_dir / 'server' / 'deploy-adapter' / 'client.ts'
    if client_file.exists():
        content = client_file.read_text()
        if 'process.env.DEPLOY_ORCHESTRATOR_URL' in content:
            score += 0.1
        if 'process.env.DEPLOY_ORCHESTRATOR_KEY' in content:
            score += 0.1
    
    return max(min(score, 1.0), 0.0)


def check_feature_isolation(src_dir: Path) -> float:
    """Check that Deploy features are properly isolated"""
    score = 1.0
    
    # Check for Nothing Brand CSS scoping
    nb_provider = src_dir / 'features' / 'deploy-workbench' / 'NothingBrandProvider.css'
    if nb_provider.exists():
        content = nb_provider.read_text()
        if '.nothing-brand-scope' in content:
            score += 0.2
        else:
            score -= 0.3
    
    # Check for lazy loading in App.jsx
    app_file = src_dir / 'App.jsx'
    if app_file.exists():
        content = app_file.read_text()
        if 'lazy(' in content and 'DeployWorkbench' in content:
            score += 0.2
        if 'Suspense' in content:
            score += 0.1
    
    return min(score, 1.0)


def main():
    parser = argparse.ArgumentParser(description='V.I.B.E. validation check')
    parser.add_argument('--threshold', type=float, default=0.90,
                       help='Minimum score threshold (default: 0.90)')
    parser.add_argument('--src', type=str, default='src',
                       help='Source directory (default: src)')
    args = parser.parse_args()
    
    src_dir = Path(args.src)
    if not src_dir.exists():
        print(f"❌ Source directory not found: {src_dir}")
        sys.exit(1)
    
    print("🔍 Running V.I.B.E. validation checks...\n")
    
    # Run checks
    checks = {
        'TypeScript Types': check_typescript_types(src_dir),
        'Error Handling': check_error_handling(src_dir),
        'Security Patterns': check_security_patterns(src_dir),
        'Feature Isolation': check_feature_isolation(src_dir)
    }
    
    # Calculate weighted score
    weights = {
        'TypeScript Types': 0.2,
        'Error Handling': 0.3,
        'Security Patterns': 0.3,
        'Feature Isolation': 0.2
    }
    
    total_score = sum(checks[k] * weights[k] for k in checks)
    
    # Display results
    print("📊 V.I.B.E. Check Results:")
    print("-" * 50)
    for check_name, score in checks.items():
        status = "✅" if score >= 0.7 else "⚠️" if score >= 0.5 else "❌"
        print(f"{status} {check_name:.<30} {score:.2f}")
    
    print("-" * 50)
    print(f"📈 Total V.I.B.E. Score: {total_score:.2f}")
    print(f"🎯 Threshold: {args.threshold:.2f}")
    print()
    
    # Pass/fail
    if total_score >= args.threshold:
        print(f"✅ V.I.B.E. check PASSED (score: {total_score:.2f} >= {args.threshold:.2f})")
        print("[Charter] Quality gates satisfied - ready for deployment")
        sys.exit(0)
    else:
        print(f"❌ V.I.B.E. check FAILED (score: {total_score:.2f} < {args.threshold:.2f})")
        print("[Ledger] Quality score below threshold - improvements required")
        sys.exit(1)


if __name__ == '__main__':
    main()
