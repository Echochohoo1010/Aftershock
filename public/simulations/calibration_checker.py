"""
CALIBRATION CHECKER: Quick Validation Against Paper Targets

Run this after your simulation to check how well it matches the paper.
Usage: python calibration_checker.py
"""

# Target values from paper (2008-2013)
PAPER_TARGETS = {
    'month_72': {
        'avg_co2_gkm': 109,         # Paper key result
        'bev_share_pct': 5.0,       # ~22,000 BEVs out of ~400,000 sales
        'company_car_pct': 50.0,    # Paper Section 3.3
        'vpt_exempt_rate': 32.0,    # Paper Fig. 3 (after tightening)
        'avg_vpt_revenue': 2900,    # Paper Fig. 4
    },
    'month_48': {
        'avg_co2_gkm': 120,         # Interpolated from Fig. 6
        'bev_share_pct': 3.0,       # Interpolated
        'vpt_exempt_rate': 40.0,    # Paper Fig. 3 (peak)
    },
    'policy_split': {
        'cct_contribution_pct': 70,  # Paper Section 4.4
        'vpt_contribution_pct': 30,  # Paper Section 4.4
    }
}

def check_calibration(simulation_results):
    """
    Check simulation results against paper targets

    Args:
        simulation_results: Dict with keys:
            - 'month_72_co2': Average CO2 at month 72
            - 'month_72_bev_share': BEV % at month 72
            - 'month_72_company_pct': Company car % at month 72
            - 'month_48_vpt_exempt': VPT exemption rate at month 48
            - etc.

    Returns:
        Dict with validation results
    """

    results = {
        'overall_score': 0,
        'max_score': 0,
        'checks': []
    }

    # Check 1: CO2 at month 72 (±5 g/km tolerance)
    if 'month_72_co2' in simulation_results:
        target = PAPER_TARGETS['month_72']['avg_co2_gkm']
        actual = simulation_results['month_72_co2']
        diff = abs(actual - target)

        if diff <= 5:
            score = 10
        elif diff <= 10:
            score = 5
        else:
            score = 0

        results['max_score'] += 10
        results['overall_score'] += score
        results['checks'].append({
            'metric': 'CO2 at Month 72',
            'target': f"{target} g/km",
            'actual': f"{actual:.1f} g/km",
            'diff': f"{actual - target:+.1f} g/km",
            'tolerance': '±5 g/km',
            'score': f"{score}/10",
            'pass': diff <= 5
        })

    # Check 2: BEV share at month 72 (±2% tolerance)
    if 'month_72_bev_share' in simulation_results:
        target = PAPER_TARGETS['month_72']['bev_share_pct']
        actual = simulation_results['month_72_bev_share']
        diff = abs(actual - target)

        if diff <= 2:
            score = 10
        elif diff <= 4:
            score = 5
        else:
            score = 0

        results['max_score'] += 10
        results['overall_score'] += score
        results['checks'].append({
            'metric': 'BEV Share at Month 72',
            'target': f"{target}%",
            'actual': f"{actual:.1f}%",
            'diff': f"{actual - target:+.1f}%",
            'tolerance': '±2%',
            'score': f"{score}/10",
            'pass': diff <= 2
        })

    # Check 3: Company car percentage (±5% tolerance)
    if 'month_72_company_pct' in simulation_results:
        target = PAPER_TARGETS['month_72']['company_car_pct']
        actual = simulation_results['month_72_company_pct']
        diff = abs(actual - target)

        if diff <= 5:
            score = 5
        else:
            score = 0

        results['max_score'] += 5
        results['overall_score'] += score
        results['checks'].append({
            'metric': 'Company Car %',
            'target': f"{target}%",
            'actual': f"{actual:.1f}%",
            'diff': f"{actual - target:+.1f}%",
            'tolerance': '±5%',
            'score': f"{score}/5",
            'pass': diff <= 5
        })

    # Check 4: VPT exemption rate at month 48 (±5% tolerance)
    if 'month_48_vpt_exempt' in simulation_results:
        target = PAPER_TARGETS['month_48']['vpt_exempt_rate']
        actual = simulation_results['month_48_vpt_exempt']
        diff = abs(actual - target)

        if diff <= 5:
            score = 5
        else:
            score = 0

        results['max_score'] += 5
        results['overall_score'] += score
        results['checks'].append({
            'metric': 'VPT Exemption Rate (Month 48)',
            'target': f"{target}%",
            'actual': f"{actual:.1f}%",
            'diff': f"{actual - target:+.1f}%",
            'tolerance': '±5%',
            'score': f"{score}/5",
            'pass': diff <= 5
        })

    # Check 5: CCT/VPT policy split (±10% tolerance)
    if 'cct_contribution' in simulation_results and 'vpt_contribution' in simulation_results:
        cct_target = PAPER_TARGETS['policy_split']['cct_contribution_pct']
        vpt_target = PAPER_TARGETS['policy_split']['vpt_contribution_pct']

        cct_actual = simulation_results['cct_contribution']
        vpt_actual = simulation_results['vpt_contribution']

        cct_diff = abs(cct_actual - cct_target)

        if cct_diff <= 10:
            score = 5
        else:
            score = 0

        results['max_score'] += 5
        results['overall_score'] += score
        results['checks'].append({
            'metric': 'CCT/VPT Policy Split',
            'target': f"{cct_target}/{vpt_target}%",
            'actual': f"{cct_actual:.1f}/{vpt_actual:.1f}%",
            'diff': f"CCT: {cct_actual - cct_target:+.1f}%",
            'tolerance': '±10%',
            'score': f"{score}/5",
            'pass': cct_diff <= 10
        })

    # Calculate overall grade
    if results['max_score'] > 0:
        results['grade_pct'] = (results['overall_score'] / results['max_score']) * 100

        if results['grade_pct'] >= 80:
            results['grade'] = 'A - Excellent calibration'
        elif results['grade_pct'] >= 60:
            results['grade'] = 'B - Good calibration'
        elif results['grade_pct'] >= 40:
            results['grade'] = 'C - Needs improvement'
        else:
            results['grade'] = 'D - Poor calibration'
    else:
        results['grade'] = 'N/A - Insufficient data'

    return results

def print_calibration_report(results):
    """Print formatted calibration report"""
    print("\n" + "="*70)
    print("CALIBRATION VALIDATION REPORT")
    print("="*70)

    for check in results['checks']:
        status = "✓ PASS" if check['pass'] else "✗ FAIL"
        print(f"\n{check['metric']}: {status}")
        print(f"  Target:    {check['target']}")
        print(f"  Actual:    {check['actual']}")
        print(f"  Diff:      {check['diff']}")
        print(f"  Tolerance: {check['tolerance']}")
        print(f"  Score:     {check['score']}")

    print("\n" + "="*70)
    print(f"OVERALL SCORE: {results['overall_score']}/{results['max_score']} ({results['grade_pct']:.1f}%)")
    print(f"GRADE: {results['grade']}")
    print("="*70 + "\n")

    # Recommendations
    failed_checks = [c for c in results['checks'] if not c['pass']]
    if failed_checks:
        print("RECOMMENDATIONS:")
        for check in failed_checks:
            metric = check['metric']
            if 'CO2' in metric:
                print(f"\n• {metric} out of range:")
                if 'Actual:' in check['actual'] and float(check['actual'].split()[0]) > float(check['target'].split()[0]):
                    print("  - CO2 too high: Strengthen policy signals")
                    print("  - Increase BIK advantage multiplier")
                    print("  - Increase policy awareness")
                else:
                    print("  - CO2 too low: Reduce policy pressure")
                    print("  - Decrease BIK advantage multiplier")

            elif 'BEV' in metric:
                print(f"\n• {metric} out of range:")
                actual_val = float(check['actual'].replace('%', ''))
                target_val = float(check['target'].replace('%', ''))
                if actual_val > target_val:
                    print("  - BEV adoption too high:")
                    print("  - Increase range_penalty to 4000")
                    print("  - Slow range_penalty_decay to 0.94")
                    print("  - Reduce BEV supply cap")
                else:
                    print("  - BEV adoption too low:")
                    print("  - Decrease range_penalty to 2500")
                    print("  - Increase BIK advantage to 6.0x")
                    print("  - Increase BEV supply cap")

# Example usage
if __name__ == "__main__":
    # Example simulation results
    example_results = {
        'month_72_co2': 115,           # Your simulation result
        'month_72_bev_share': 7.5,     # Your simulation result
        'month_72_company_pct': 48,    # Your simulation result
        'month_48_vpt_exempt': 35,     # Your simulation result
        'cct_contribution': 65,        # Your simulation result
        'vpt_contribution': 35         # Your simulation result
    }

    results = check_calibration(example_results)
    print_calibration_report(results)

    print("\n" + "="*70)
    print("QUICK REFERENCE: Paper Targets")
    print("="*70)
    print("\nMonth 72 (Year 6 - End of Paper Period):")
    print(f"  Average CO2:     {PAPER_TARGETS['month_72']['avg_co2_gkm']} g/km")
    print(f"  BEV Share:       {PAPER_TARGETS['month_72']['bev_share_pct']}%")
    print(f"  Company Cars:    {PAPER_TARGETS['month_72']['company_car_pct']}%")
    print(f"  VPT Exemptions:  {PAPER_TARGETS['month_72']['vpt_exempt_rate']}%")
    print("\nMonth 48 (Year 4 - Peak Exemptions):")
    print(f"  VPT Exemptions:  {PAPER_TARGETS['month_48']['vpt_exempt_rate']}%")
    print("\nPolicy Contribution:")
    print(f"  CCT (Company Car Tax): {PAPER_TARGETS['policy_split']['cct_contribution_pct']}%")
    print(f"  VPT (Purchase Tax):    {PAPER_TARGETS['policy_split']['vpt_contribution_pct']}%")
    print("="*70 + "\n")
