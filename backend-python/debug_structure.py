#!/usr/bin/env python3
"""
Lance depuis backend-python/ :  python debug_structure.py
Affiche la VRAIE structure de productData.js
"""
import re, os

PATH = '../backend/data/productData.js'

content = open(PATH, encoding='utf-8').read()
print(f"Taille: {len(content)} chars\n")

# Afficher les 80 premières lignes
print("="*60)
print("DEBUT DU FICHIER (80 lignes):")
print("="*60)
for i, line in enumerate(content.split('\n')[:80], 1):
    print(f"{i:3}: {repr(line)}")