#!/usr/bin/env python3
"""
EduAI Language Migration Tool
Converts a French codebase to English for international hackathons
Usage: python translate_project.py --input ./src --output ./src_en
"""

import os
import re
import argparse
import shutil
from pathlib import Path
from typing import List, Dict, Tuple, Set, Optional
import json
import time

# Required installation: pip install deep-translator rich
try:
    from deep_translator import GoogleTranslator
    from rich.console import Console
    from rich.progress import Progress, TaskID
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

console = Console()

# Dictionnaire des traductions techniques spécifiques
TECHNICAL_TERMS = {
    # Classes et fonctions
    "TexteProcesseur": "TextProcessor",
    "AnalyseurEmotion": "EmotionAnalyzer", 
    "ProcesseurParole": "SpeechProcessor",
    "ProcesseurVision": "VisionProcessor",
    "traiterTexte": "processText",
    "analyserEmotion": "analyzeEmotion",
    "texteVersParole": "textToSpeech",
    "paroleVersTexte": "speechToText",
    
    # Variables et termes métier
    "utilisateur": "user",
    "apprentissage": "learning",
    "adaptif": "adaptive",
    "éducation": "education",
    "cours": "course",
    "étudiant": "student",
    "intelligence": "intelligence",
    "artificielle": "artificial",
    "évaluation": "assessment",
    "niveau": "level",
    "progrès": "progress",
    "exercice": "exercise",
    "traduction": "translation",
    "multilingue": "multilingual",
    "émotionnel": "emotional",
    "vision": "vision",
    "parole": "speech",
    "configuration": "configuration",
    "paramètres": "settings",
    "résultat": "result",
    
    # Structure de projet
    "services_ia": "ai_services",
    "frontend": "frontend",
    "backend": "backend",
    "docs": "docs",
    "scripts": "scripts",
    "tests": "tests",
    
    # Commentaires communs
    "TODO": "TODO",
    "FIXME": "FIXME",
    "NOTE": "NOTE",
}

# Liste des fichiers à ignorer
IGNORE_PATHS = [
    "node_modules",
    "__pycache__",
    "venv",
    ".git",
    "dist",
    "build",
    ".next",
]

# Extensions à traiter
CODE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", 
    ".vue", ".html", ".css", ".scss",
    ".md", ".txt", ".json", ".yaml", ".yml"
}

def setup_argparse() -> argparse.Namespace:
    """Configure command line arguments."""
    parser = argparse.ArgumentParser(description="Convert French code to English")
    parser.add_argument("--input", "-i", required=True, help="Source directory containing French code")
    parser.add_argument("--output", "-o", required=True, help="Destination directory for English code")
    parser.add_argument("--dry-run", "-d", action="store_true", help="Simulation without modification")
    parser.add_argument("--no-translate", "-n", action="store_true", help="Do not translate comments and strings")
    parser.add_argument("--skip-ui", "-s", action="store_true", help="Do not translate user interface strings")
    return parser.parse_args()

def should_ignore(path: str) -> bool:
    """Checks if a path should be ignored."""
    for ignore in IGNORE_PATHS:
        if ignore in path:
            return True
    return False

def collect_files(input_dir: str) -> List[str]:
    """Collects all files to translate."""
    files = []
    for root, _, filenames in os.walk(input_dir):
        if should_ignore(root):
            continue
        
        for filename in filenames:
            path = os.path.join(root, filename)
            _, ext = os.path.splitext(filename)
            
            if ext in CODE_EXTENSIONS and not should_ignore(path):
                files.append(path)
    
    return files

def is_binary(file_path: str) -> bool:
    """Checks if a file is binary."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            file.read(1024)
        return False
    except UnicodeDecodeError:
        return True

def translate_technical_terms(text: str) -> str:
    """Replaces technical terms with their English equivalents."""
    # Avoid false positives by looking for complete words
    for fr_term, en_term in TECHNICAL_TERMS.items():
        # Utilisez \b pour les limites de mots
        text = re.sub(r'\b' + fr_term + r'\b', en_term, text)
    return text

def translate_text(text: str) -> str:
    """Translates text from French to English."""
    if not TRANSLATOR_AVAILABLE:
        console.print("[yellow]Translation disabled: install deep-translator[/yellow]")
        return text
    
    # Limit length to avoid API errors
    if len(text) > 4000:
        parts = []
        for i in range(0, len(text), 4000):
            part = text[i:i+4000]
            translated_part = GoogleTranslator(source='fr', target='en').translate(part)
            parts.append(translated_part)
        return ''.join(parts)
    else:
        try:
            return GoogleTranslator(source='fr', target='en').translate(text)
        except Exception as e:
            console.print(f"[red]Translation error: {e}[/red]")
            return text

def translate_comments(content: str, file_ext: str) -> str:
    """Translates comments in the code."""
    if file_ext == '.py':
        # Commentaires multi-lignes Python
        pattern = r'"""(.*?)"""'
        content = re.sub(pattern, lambda m: '"""' + translate_text(m.group(1)) + '"""', 
                         content, flags=re.DOTALL)
        
        # Commentaires une ligne Python
        pattern = r'#\s*(.*)'
        content = re.sub(pattern, lambda m: '# ' + translate_text(m.group(1)), content)
        
    elif file_ext in ['.js', '.jsx', '.ts', '.tsx']:
        # Commentaires multi-lignes JS
        pattern = r'/\*(.*?)\*/'
        content = re.sub(pattern, lambda m: '/*' + translate_text(m.group(1)) + '*/', 
                         content, flags=re.DOTALL)
        
        # Commentaires JSDoc
        pattern = r'/\*\*(.*?)\*/'
        content = re.sub(pattern, lambda m: '/**' + translate_text(m.group(1)) + '*/', 
                         content, flags=re.DOTALL)
        
        # Commentaires une ligne JS
        pattern = r'//\s*(.*)'
        content = re.sub(pattern, lambda m: '// ' + translate_text(m.group(1)), content)
        
    elif file_ext == '.html':
        # Commentaires HTML
        pattern = r'<!--(.*?)-->'
        content = re.sub(pattern, lambda m: '<!--' + translate_text(m.group(1)) + '-->', 
                         content, flags=re.DOTALL)
    
    return content

def translate_strings(content: str, file_ext: str) -> str:
    """Translates strings in the code."""
    if file_ext in ['.py', '.js', '.jsx', '.ts', '.tsx']:
        # Chaînes avec guillemets simples
        pattern = r"'([^'\\]*(?:\\.[^'\\]*)*)'(?!\s*:)"
        content = re.sub(pattern, lambda m: "'" + translate_text(m.group(1)) + "'", content)
        
        # Chaînes avec guillemets doubles
        pattern = r'"([^"\\]*(?:\\.[^"\\]*)*)"(?!\s*:)'
        content = re.sub(pattern, lambda m: '"' + translate_text(m.group(1)) + '"', content)
        
    elif file_ext == '.html':
        # Texte dans les balises HTML
        pattern = r'>([^<>]+)<'
        content = re.sub(pattern, lambda m: '>' + translate_text(m.group(1)) + '<', content)
        
    return content

def rename_variables(content: str) -> str:
    """Renames French variables and functions."""
    # Renommer les classes, fonctions et variables
    for fr_term, en_term in TECHNICAL_TERMS.items():
        # Motif pour identifier variables/fonctions
        var_pattern = r'\b(var|let|const|function|class|def|self\.)\s+' + fr_term + r'\b'
        content = re.sub(var_pattern, r'\1 ' + en_term, content)
        
    return content

def translate_file(input_path: str, output_path: str, args) -> None:
    """Translates a file from French to English."""
    if is_binary(input_path):
        shutil.copy(input_path, output_path)
        return
    
    _, ext = os.path.splitext(input_path)
    
    with open(input_path, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # Step 1: Translate technical terms
    content = translate_technical_terms(content)
    
    if not args.no_translate:
        # Step 2: Translate comments
        content = translate_comments(content, ext)
        
        # Step 3: Translate strings unless --skip-ui is specified
        if not args.skip_ui:
            content = translate_strings(content, ext)
    
    # Step 4: Rename variables
    content = rename_variables(content)
    
    # Traitement spécial pour les fichiers JSON/YAML dans certains dossiers
    if ext in ['.json', '.yaml', '.yml'] and ('translation' in input_path or 'i18n' in input_path):
        try:
            # Traiter les fichiers de traduction
            if ext == '.json':
                data = json.loads(content)
                translated_data = translate_json_values(data)
                content = json.dumps(translated_data, ensure_ascii=False, indent=2)
        except json.JSONDecodeError:
            console.print(f"[yellow]Erreur de format JSON dans {input_path}[/yellow]")
    
    # Écrire le contenu traduit
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(content)

def translate_json_values(data: Dict) -> Dict:
    """Traduit récursivement les valeurs dans un dictionnaire JSON."""
    if isinstance(data, dict):
        return {k: translate_json_values(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [translate_json_values(item) for item in data]
    elif isinstance(data, str) and len(data) > 1:  # Translate only non-empty strings
        return translate_text(data)
    else:
        return data

def process_project(args: argparse.Namespace) -> None:
    """Process the entire project, translating files from French to English."""
    files = collect_files(args.input)
    total_files = len(files)
    
    console.print(f"[bold green]Starting translation of {total_files} files...[/bold green]")
    
    if args.dry_run:
        console.print("[bold yellow]Dry run mode: no changes will be made[/bold yellow]")
    
    with Progress() as progress:
        task = progress.add_task("[cyan]Translating...", total=total_files)
        
        for i, file_path in enumerate(files):
            rel_path = os.path.relpath(file_path, args.input)
            output_path = os.path.join(args.output, rel_path)
            
            progress.update(task, advance=1, description=f"[cyan]Translating {i+1}/{total_files}: {rel_path}")
            
            if not args.dry_run:
                translate_file(file_path, output_path, args)
                # Small pause to avoid overloading the API
                time.sleep(0.1)
    
    console.print("[bold green]✓ Translation completed successfully![/bold green]")

def main() -> None:
    """Main function."""
    args = setup_argparse()
    
    if not TRANSLATOR_AVAILABLE and not args.no_translate:
        console.print("[bold red]Error: Required modules not installed.[/bold red]")
        console.print("Install dependencies with: [green]pip install deep-translator rich[/green]")
        return

    console.print("[bold blue]===== EduAI Language Migration Tool =====[/bold blue]")

    # Check that directories exist
    if not os.path.isdir(args.input):
        console.print(
            f"[bold red]Error: Source directory '{args.input}' does not exist.[/bold red]"
        )
        return

    process_project(args)


if __name__ == "__main__":
    main()
