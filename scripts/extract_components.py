#!/usr/bin/env python3
"""Extract large components from page.js into separate files."""

import re
import os

PAGE_JS = '/app/app/page.js'
COMPONENTS_DIR = '/app/app/components'

# All known lucide-react icons used in the project
ALL_ICONS = [
    'Calendar', 'FileText', 'Users', 'Inbox', 'LogOut', 'Plus', 'Send', 'Dog', 'Cat', 'Clock', 'Mail', 'User',
    'Building2', 'Phone', 'PawPrint', 'Search', 'Zap', 'Shield', 'Heart', 'MessageCircle', 'Bell',
    'CheckCircle', 'ChevronRight', 'Menu', 'X', 'CalendarDays', 'ClipboardList', 'Settings',
    'Star', 'Check', 'Upload', 'Paperclip', 'AlertCircle', 'RefreshCw', 'Eye', 'Download',
    'UserCheck', 'Ticket', 'Filter', 'MoreHorizontal', 'ExternalLink', 'Video', 'CalendarCheck',
    'CreditCard', 'PlayCircle', 'ArrowRight', 'FileCheck', 'Stethoscope', 'SendHorizontal',
    'LayoutDashboard', 'ListTodo', 'CircleDot', 'Timer', 'TrendingUp', 'Activity',
    'MapPin', 'Globe', 'Receipt', 'Syringe', 'Weight', 'AlertTriangle', 'ChevronLeft',
    'Euro', 'Wallet', 'Camera', 'Edit', 'Trash2', 'Info', 'StarHalf', 'Scissors',
    'BarChart3', 'Gift', 'Lock', 'Sparkles', 'UserPlus', 'PlusCircle', 'Loader2',
    'FolderArchive', 'BookOpen', 'GraduationCap', 'Newspaper', 'Link2', 'CalendarRange', 'Droplet', 'Archive',
    'Smartphone', 'Navigation', 'Share2', 'Copy', 'Beaker', 'Save', 'CalendarX',
    'FlaskConical', 'Package', 'XCircle', 'CheckCircle2', 'MousePointerClick', 'Image', 'EyeOff',
    'ChevronDown', 'ChevronUp', 'Maximize2', 'Minimize2', 'Home', 'RotateCw',
]

# All shadcn components
ALL_SHADCN = {
    'Button': '@/components/ui/button',
    'Input': '@/components/ui/input',
    'Card': '@/components/ui/card',
    'CardContent': '@/components/ui/card',
    'CardDescription': '@/components/ui/card',
    'CardHeader': '@/components/ui/card',
    'CardTitle': '@/components/ui/card',
    'Tabs': '@/components/ui/tabs',
    'TabsContent': '@/components/ui/tabs',
    'TabsList': '@/components/ui/tabs',
    'TabsTrigger': '@/components/ui/tabs',
    'Dialog': '@/components/ui/dialog',
    'DialogContent': '@/components/ui/dialog',
    'DialogDescription': '@/components/ui/dialog',
    'DialogHeader': '@/components/ui/dialog',
    'DialogTitle': '@/components/ui/dialog',
    'DialogTrigger': '@/components/ui/dialog',
    'DialogFooter': '@/components/ui/dialog',
    'Label': '@/components/ui/label',
    'Select': '@/components/ui/select',
    'SelectContent': '@/components/ui/select',
    'SelectItem': '@/components/ui/select',
    'SelectTrigger': '@/components/ui/select',
    'SelectValue': '@/components/ui/select',
    'Textarea': '@/components/ui/textarea',
    'Badge': '@/components/ui/badge',
    'ScrollArea': '@/components/ui/scroll-area',
    'Accordion': '@/components/ui/accordion',
    'AccordionContent': '@/components/ui/accordion',
    'AccordionItem': '@/components/ui/accordion',
    'AccordionTrigger': '@/components/ui/accordion',
    'Switch': '@/components/ui/switch',
    'Progress': '@/components/ui/progress',
}

# Shared project imports
SHARED_IMPORTS = {
    'api': "import api from '@/app/lib/api';",
    'getPetSpeciesInfo': "import { getPetSpeciesInfo, PetAvatar, NewBrandLogo, calculateAge } from '@/app/components/shared/utils';",
    'PetAvatar': "import { getPetSpeciesInfo, PetAvatar, NewBrandLogo, calculateAge } from '@/app/components/shared/utils';",
    'NewBrandLogo': "import { getPetSpeciesInfo, PetAvatar, NewBrandLogo, calculateAge } from '@/app/components/shared/utils';",
    'calculateAge': "import { getPetSpeciesInfo, PetAvatar, NewBrandLogo, calculateAge } from '@/app/components/shared/utils';",
}


def find_used_icons(code):
    """Find all lucide-react icons used in component code."""
    used = set()
    for icon in ALL_ICONS:
        # Match <IconName or icon={IconName} or Icon={IconName}
        patterns = [
            rf'<{icon}[\s/>]',
            rf'icon=\{{{icon}\}}',
            rf'Icon=\{{{icon}\}}',
            rf'\b{icon}\b',
        ]
        for pat in patterns:
            if re.search(pat, code):
                used.add(icon)
                break
    # Special case: Image is both an icon and a keyword
    if 'Image' in used and 'ImageIcon' in code:
        used.add('ImageIcon')
    return sorted(used)


def find_used_shadcn(code):
    """Find all shadcn components used in component code."""
    used = {}
    for comp, path in ALL_SHADCN.items():
        if re.search(rf'<{comp}[\s/>]|</{comp}>', code):
            if path not in used:
                used[path] = []
            used[path].append(comp)
    return used


def find_react_hooks(code):
    """Find React hooks used."""
    hooks = []
    for hook in ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo']:
        if hook in code:
            hooks.append(hook)
    return hooks


def generate_imports(code, func_name):
    """Generate all necessary imports for a component."""
    imports = ["'use client';\n"]
    
    # React hooks
    hooks = find_react_hooks(code)
    if hooks:
        imports.append(f"import {{ {', '.join(hooks)} }} from 'react';")
    
    # Shadcn components
    shadcn = find_used_shadcn(code)
    for path, comps in sorted(shadcn.items()):
        imports.append(f"import {{ {', '.join(sorted(set(comps)))} }} from '{path}';")
    
    # Lucide icons
    icons = find_used_icons(code)
    if icons:
        # Handle Image/ImageIcon alias
        icon_imports = []
        for ic in icons:
            if ic == 'ImageIcon':
                continue  # handled below
            elif ic == 'Image' and 'ImageIcon' in icons:
                icon_imports.append('Image as ImageIcon')
            else:
                icon_imports.append(ic)
        if icon_imports:
            imports.append(f"import {{ {', '.join(icon_imports)} }} from 'lucide-react';")
    
    # API
    if 'api.' in code or "api.get" in code or "api.post" in code or "api.put" in code or "api.delete" in code:
        imports.append("import api from '@/app/lib/api';")
    
    # Shared utils
    shared_needed = []
    if 'getPetSpeciesInfo' in code:
        shared_needed.append('getPetSpeciesInfo')
    if 'PetAvatar' in code:
        shared_needed.append('PetAvatar')
    if 'NewBrandLogo' in code:
        shared_needed.append('NewBrandLogo')
    if 'calculateAge' in code and 'const calculateAge' not in code:
        shared_needed.append('calculateAge')
    if shared_needed:
        imports.append(f"import {{ {', '.join(shared_needed)} }} from '@/app/components/shared/utils';")
    
    return '\n'.join(imports)


def extract_component(lines, func_name, start_idx, end_idx):
    """Extract a component and generate its standalone file."""
    code_lines = lines[start_idx:end_idx + 1]
    code = '\n'.join(code_lines)
    
    imports = generate_imports(code, func_name)
    
    # Build the file
    file_content = f"{imports}\n\n{code}\n\nexport default {func_name};\n"
    return file_content


def main():
    with open(PAGE_JS, 'r') as f:
        lines = f.readlines()
    
    lines_content = [l.rstrip('\n') for l in lines]
    
    # Find all function definitions
    functions = []
    for i, line in enumerate(lines_content):
        if line.startswith('function '):
            match = re.match(r'function\s+(\w+)', line)
            if match:
                functions.append((i, match.group(1)))
    
    # Map function -> (start_idx, end_idx)
    func_ranges = {}
    for idx, (start, name) in enumerate(functions):
        if idx + 1 < len(functions):
            end = functions[idx + 1][0] - 1
        else:
            end = len(lines_content) - 1
        func_ranges[name] = (start, end)
    
    # Components to extract with their target directories
    to_extract = {
        'ClinicAgenda': 'clinic',
        'ClinicPatients': 'clinic',
        'ClinicSettings': 'clinic',
        'ClinicInvoicing': 'clinic',
        'ClinicLabAnalysis': 'clinic',
        'ClinicTemplates': 'clinic',
        'ClinicReports': 'clinic',
        'ClinicDocuments': 'clinic',
        'ClinicRewardsManagement': 'clinic',
        'ClinicServices': 'clinic',
        'ClinicVideoConsult': 'clinic',
        'ClinicEvents': 'clinic',
        'ClinicAutomations': 'clinic',
        'ClinicArchive': 'clinic',
        'ClinicFeedbackPage': 'clinic',
        'ClinicReviews': 'clinic',
        'OwnerAppointments': 'owner',
        'OwnerDocuments': 'owner',
        'OwnerMessages': 'owner',
        'OwnerPets': 'owner',
        'OwnerEvents': 'owner',
        'OwnerRewardsSection': 'owner',
        'OwnerReviews': 'owner',
        'OwnerInvoices': 'owner',
        'OwnerProfile': 'owner',
        'PetProfile': 'owner',
        'FindClinic': 'owner',
        'InviteClinic': 'owner',
        'LabDashboard': 'lab',
        'AdminDashboard': 'admin',
        'StaffDashboard': 'staff',
    }
    
    # Extract each component
    total_extracted = 0
    for func_name, subdir in to_extract.items():
        if func_name not in func_ranges:
            print(f"  SKIP: {func_name} not found")
            continue
        
        start, end = func_ranges[func_name]
        size = end - start + 1
        
        # Create directory
        dir_path = os.path.join(COMPONENTS_DIR, subdir)
        os.makedirs(dir_path, exist_ok=True)
        
        # Generate file
        file_content = extract_component(lines_content, func_name, start, end)
        file_path = os.path.join(dir_path, f'{func_name}.js')
        
        with open(file_path, 'w') as f:
            f.write(file_content)
        
        total_extracted += size
        print(f"  ✅ {func_name} -> components/{subdir}/{func_name}.js ({size} lines)")
    
    print(f"\nTotal extracted: {total_extracted} lines")
    print(f"Files created in {COMPONENTS_DIR}/")


if __name__ == '__main__':
    main()
