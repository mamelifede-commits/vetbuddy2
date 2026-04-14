#!/usr/bin/env python3
"""Remove extracted components from page.js and replace with imports."""

import re

PAGE_JS = '/app/app/page.js'

# Components that were extracted and their import paths
COMPONENTS = {
    'ClinicAgenda': '@/app/components/clinic/ClinicAgenda',
    'ClinicPatients': '@/app/components/clinic/ClinicPatients',
    'ClinicSettings': '@/app/components/clinic/ClinicSettings',
    'ClinicInvoicing': '@/app/components/clinic/ClinicInvoicing',
    'ClinicLabAnalysis': '@/app/components/clinic/ClinicLabAnalysis',
    'ClinicTemplates': '@/app/components/clinic/ClinicTemplates',
    'ClinicReports': '@/app/components/clinic/ClinicReports',
    'ClinicDocuments': '@/app/components/clinic/ClinicDocuments',
    'ClinicRewardsManagement': '@/app/components/clinic/ClinicRewardsManagement',
    'ClinicServices': '@/app/components/clinic/ClinicServices',
    'ClinicVideoConsult': '@/app/components/clinic/ClinicVideoConsult',
    'ClinicEvents': '@/app/components/clinic/ClinicEvents',
    'ClinicAutomations': '@/app/components/clinic/ClinicAutomations',
    'ClinicArchive': '@/app/components/clinic/ClinicArchive',
    'ClinicFeedbackPage': '@/app/components/clinic/ClinicFeedbackPage',
    'ClinicReviews': '@/app/components/clinic/ClinicReviews',
    'OwnerAppointments': '@/app/components/owner/OwnerAppointments',
    'OwnerDocuments': '@/app/components/owner/OwnerDocuments',
    'OwnerMessages': '@/app/components/owner/OwnerMessages',
    'OwnerPets': '@/app/components/owner/OwnerPets',
    'OwnerEvents': '@/app/components/owner/OwnerEvents',
    'OwnerRewardsSection': '@/app/components/owner/OwnerRewardsSection',
    'OwnerReviews': '@/app/components/owner/OwnerReviews',
    'OwnerInvoices': '@/app/components/owner/OwnerInvoices',
    'OwnerProfile': '@/app/components/owner/OwnerProfile',
    'PetProfile': '@/app/components/owner/PetProfile',
    'FindClinic': '@/app/components/owner/FindClinic',
    'InviteClinic': '@/app/components/owner/InviteClinic',
    'LabDashboard': '@/app/components/lab/LabDashboard',
    'AdminDashboard': '@/app/components/admin/AdminDashboard',
    'StaffDashboard': '@/app/components/staff/StaffDashboard',
}


def main():
    with open(PAGE_JS, 'r') as f:
        lines = f.readlines()
    
    lines_stripped = [l.rstrip('\n') for l in lines]
    
    # Find all function definitions
    functions = []
    for i, line in enumerate(lines_stripped):
        if line.startswith('function '):
            match = re.match(r'function\s+(\w+)', line)
            if match:
                functions.append((i, match.group(1)))
    
    # Map function -> (start_idx, end_idx) (0-based)
    func_ranges = {}
    for idx, (start, name) in enumerate(functions):
        if idx + 1 < len(functions):
            end = functions[idx + 1][0] - 1
        else:
            end = len(lines_stripped) - 1
        func_ranges[name] = (start, end)
    
    # Collect line ranges to remove (sorted in reverse to avoid index shifting)
    ranges_to_remove = []
    for comp_name in COMPONENTS:
        if comp_name in func_ranges:
            start, end = func_ranges[comp_name]
            ranges_to_remove.append((start, end, comp_name))
            print(f"  Will remove {comp_name}: lines {start+1}-{end+1} ({end-start+1} lines)")
    
    # Sort by start line in reverse
    ranges_to_remove.sort(key=lambda x: x[0], reverse=True)
    
    # Remove the functions from lines (working backwards)
    for start, end, name in ranges_to_remove:
        # Also remove any blank lines right before the function
        actual_start = start
        while actual_start > 0 and lines_stripped[actual_start - 1].strip() == '':
            actual_start -= 1
        
        del lines_stripped[actual_start:end + 1]
        print(f"  Removed {name} ({end - actual_start + 1} lines)")
    
    # Generate import statements
    import_lines = [f"import {name} from '{path}';" for name, path in sorted(COMPONENTS.items())]
    
    # Find where to insert imports (after existing imports, before first function)
    insert_idx = 0
    for i, line in enumerate(lines_stripped):
        if line.startswith('import ') or line.startswith('} from '):
            insert_idx = i + 1
    
    # Insert import block
    import_block = '\n// Extracted Components\n' + '\n'.join(import_lines) + '\n'
    lines_stripped.insert(insert_idx, import_block)
    
    # Write back
    with open(PAGE_JS, 'w') as f:
        f.write('\n'.join(lines_stripped))
    
    total_lines = len(lines_stripped)
    print(f"\nDone! page.js now has {total_lines} lines")


if __name__ == '__main__':
    main()
