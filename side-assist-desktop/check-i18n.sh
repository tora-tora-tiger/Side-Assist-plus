#!/bin/bash

# Side Assist Desktop i18n Leak Checker
# Checks for hardcoded strings that should be internationalized

echo "🌍 Side Assist Desktop i18n Leak Checker"
echo "========================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories to check
SRC_DIR="src"
ISSUES_FOUND=0

echo -e "${BLUE}Checking for hardcoded strings in React components...${NC}"
echo

# Function to check for potential hardcoded strings
check_hardcoded_strings() {
    local file="$1"
    local line_num=0
    
    # Skip checking translation files and config files
    if [[ "$file" == *"/locales/"* ]] || [[ "$file" == *"i18n.ts"* ]] || [[ "$file" == *".css"* ]]; then
        return
    fi
    
    echo -e "${BLUE}📄 Checking: $file${NC}"
    
    # Check for common patterns that might be hardcoded strings
    while IFS= read -r line; do
        ((line_num++))
        
        # Skip comments and imports
        if [[ "$line" =~ ^[[:space:]]*// ]] || [[ "$line" =~ ^[[:space:]]*import ]] || [[ "$line" =~ ^[[:space:]]*\* ]] || [[ "$line" =~ ^[[:space:]]*\*/ ]]; then
            continue
        fi
        
        # Check for potential hardcoded UI strings (excluding technical strings)
        if echo "$line" | grep -E "(className=|console\.|error|log)" > /dev/null; then
            continue  # Skip technical strings
        fi
        
        # Look for quoted strings that might be user-facing (excluding technical strings)
        potential_strings=$(echo "$line" | grep -oE '"[^"]{3,}"' | grep -v -E '"(http|https|localhost|[0-9]+|bg-|text-|border-|rounded-|px-|py-|flex|grid|space-|items-|justify-|w-|h-|m-|p-|shadow|dark:|focus:|hover:|disabled:|opacity|cursor|ring|outline|get_|start_|simulate_|invoke|tauri|core|react|useState|useEffect|type|className|onClick|onChange|onKeyDown|value|disabled|maxLength)')
        
        if [ ! -z "$potential_strings" ]; then
            # Check if it's already using t() function
            if ! echo "$line" | grep -q "t("; then
                # Additional filtering for technical strings
                filtered_strings=$(echo "$potential_strings" | grep -v -E '"(text|submit|button|input|div|span|header|main|section|article)"')
                if [ ! -z "$filtered_strings" ]; then
                    echo -e "${YELLOW}  ⚠️  Line $line_num: Potential hardcoded string${NC}"
                    echo -e "      ${RED}$filtered_strings${NC}"
                    echo -e "      Context: ${line// /}"
                    ((ISSUES_FOUND++))
                    echo
                fi
            fi
        fi
        
        # Check for specific patterns that are likely user-facing
        if echo "$line" | grep -E "(placeholder=|title=|alt=|aria-label=)" | grep -v "t(" > /dev/null; then
            echo -e "${YELLOW}  ⚠️  Line $line_num: Hardcoded attribute text${NC}"
            echo -e "      Context: $line"
            ((ISSUES_FOUND++))
            echo
        fi
        
    done < "$file"
}

# Function to check translation completeness
check_translation_completeness() {
    echo -e "${BLUE}🔍 Checking translation completeness...${NC}"
    
    if [ ! -f "src/locales/en.json" ] || [ ! -f "src/locales/ja.json" ]; then
        echo -e "${RED}❌ Translation files not found!${NC}"
        ((ISSUES_FOUND++))
        return
    fi
    
    # Extract all translation keys from both files
    en_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' src/locales/en.json 2>/dev/null | sort)
    ja_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' src/locales/ja.json 2>/dev/null | sort)
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  jq not found, skipping JSON validation${NC}"
        echo "   Install jq for better translation validation: brew install jq"
        echo
        return
    fi
    
    # Check for missing keys in Japanese translation
    missing_in_ja=$(comm -23 <(echo "$en_keys") <(echo "$ja_keys"))
    if [ ! -z "$missing_in_ja" ]; then
        echo -e "${RED}❌ Missing keys in Japanese translation:${NC}"
        echo "$missing_in_ja" | sed 's/^/    /'
        ((ISSUES_FOUND++))
        echo
    fi
    
    # Check for missing keys in English translation
    missing_in_en=$(comm -23 <(echo "$ja_keys") <(echo "$en_keys"))
    if [ ! -z "$missing_in_en" ]; then
        echo -e "${RED}❌ Missing keys in English translation:${NC}"
        echo "$missing_in_en" | sed 's/^/    /'
        ((ISSUES_FOUND++))
        echo
    fi
    
    if [ -z "$missing_in_ja" ] && [ -z "$missing_in_en" ]; then
        echo -e "${GREEN}✅ All translation keys are present in both languages${NC}"
        echo
    fi
}

# Function to check for unused translation keys
check_unused_keys() {
    echo -e "${BLUE}🔍 Checking for unused translation keys...${NC}"
    
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not found, skipping unused key check${NC}"
        return
    fi
    
    # Get all translation keys
    all_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' src/locales/en.json 2>/dev/null)
    
    unused_keys=""
    while IFS= read -r key; do
        # Check if key is used in any .tsx or .ts file
        if ! grep -r "t('$key')" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
            if ! grep -r "t(\"$key\")" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
                unused_keys="$unused_keys\n    $key"
            fi
        fi
    done <<< "$all_keys"
    
    if [ ! -z "$unused_keys" ]; then
        echo -e "${YELLOW}⚠️  Potentially unused translation keys:${NC}"
        echo -e "$unused_keys"
        echo
    else
        echo -e "${GREEN}✅ All translation keys appear to be in use${NC}"
        echo
    fi
}

# Main execution
if [ ! -d "$SRC_DIR" ]; then
    echo -e "${RED}❌ Source directory '$SRC_DIR' not found!${NC}"
    exit 1
fi

# Check all TypeScript and TSX files
find "$SRC_DIR" -name "*.ts" -o -name "*.tsx" | while read -r file; do
    check_hardcoded_strings "$file"
done

# Check translation completeness
check_translation_completeness

# Check for unused keys
check_unused_keys

# Summary
echo "========================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 No i18n issues found! Your app is fully internationalized.${NC}"
    echo
    echo -e "${BLUE}💡 Tips:${NC}"
    echo "   - Use t('key.name') for user-facing strings"
    echo "   - Keep technical strings (CSS classes, URLs) untranslated"
    echo "   - Test language switching in the app"
    echo
    exit 0
else
    echo -e "${RED}🚨 Found $ISSUES_FOUND potential i18n issues.${NC}"
    echo -e "${YELLOW}📝 Review the issues above and consider adding translations.${NC}"
    echo
    echo -e "${RED}💥 Commit blocked due to i18n issues!${NC}"
    echo -e "${YELLOW}Fix the issues above and try again.${NC}"
    echo
    exit 1
fi