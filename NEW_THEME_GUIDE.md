# 🎨 Nouveau Thème : Blanc, Noir et Or

## ✨ **Vue d'ensemble**

Votre site web a été transformé avec un thème élégant et sophistiqué utilisant les couleurs **blanc**, **noir** et **or**.

## 🎯 **Palette de Couleurs**

### **Couleurs Principales :**
- **Blanc** (`#ffffff`) : Arrière-plans, textes sur fond sombre
- **Noir** (`#000000`) : Textes principaux, boutons, éléments de navigation
- **Or** (`#eab308`) : Accents, bordures, éléments interactifs

### **Variations d'Or :**
- **Or clair** (`#fde047`) : Hover states, éléments secondaires
- **Or foncé** (`#ca8a04`) : Boutons, éléments actifs
- **Or très foncé** (`#a16207`) : États pressés, éléments sélectionnés

## 🏗️ **Architecture du Thème**

### **1. Configuration Tailwind (`tailwind.config.js`)**
```javascript
colors: {
  primary: {
    // Blancs et gris clairs
    50: '#fefefe',
    500: '#ffffff',
    900: '#a3a3a3',
  },
  gold: {
    // Palette d'or complète
    50: '#fefce8',
    500: '#eab308',
    900: '#713f12',
  },
  dark: {
    // Noirs et gris foncés
    50: '#f8fafc',
    900: '#0f172a',
  }
}
```

### **2. Variables CSS (`globals.css`)**
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --accent: #eab308;
  --accent-light: #fde047;
  --accent-dark: #ca8a04;
}
```

## 🎨 **Éléments de Design**

### **Navigation :**
- **Header** : Fond blanc avec bordure or
- **Logo** : "Course" en or, "Web" en noir/blanc
- **Liens** : Noir avec hover en or
- **Boutons** : Noir avec bordure or

### **Boutons :**
```css
.btn-primary {
  @apply bg-black text-white hover:bg-gray-800 border border-gold-500;
}

.btn-accent {
  @apply bg-gold-500 text-black hover:bg-gold-600;
}
```

### **Cartes et Conteneurs :**
- **Fond** : Blanc (mode clair) / Noir (mode sombre)
- **Bordures** : Or subtil
- **Ombres** : Douces avec teinte dorée

### **Formulaires :**
- **Inputs** : Bordure grise avec focus en or
- **Focus rings** : Or avec offset approprié

## 🌙 **Mode Sombre**

Le thème s'adapte automatiquement au mode sombre :
- **Fond** : Noir pur (`#000000`)
- **Texte** : Blanc pur (`#ffffff`)
- **Accents** : Or maintenu pour la cohérence
- **Bordures** : Or plus foncé pour le contraste

## 🎯 **Utilisation des Classes**

### **Classes Utilitaires :**
```html
<!-- Texte en or -->
<span class="text-gold-500">Texte doré</span>

<!-- Bouton principal -->
<button class="btn-primary">Action</button>

<!-- Bouton accent -->
<button class="btn-accent">Action secondaire</button>

<!-- Carte avec bordure or -->
<div class="card border-gold-200">Contenu</div>

<!-- Gradient doré -->
<span class="gold-gradient-text">Texte avec gradient</span>
```

### **Classes de Couleurs :**
- `text-gold-500` : Texte en or
- `bg-gold-100` : Fond or très clair
- `border-gold-300` : Bordure or claire
- `hover:text-gold-600` : Hover en or plus foncé

## 🚀 **Avantages du Thème**

### **1. Élégance :**
- Combinaison sophistiquée de couleurs
- Contraste optimal pour la lisibilité
- Accents dorés pour le prestige

### **2. Accessibilité :**
- Contraste élevé entre texte et fond
- États de focus clairement visibles
- Compatible avec les lecteurs d'écran

### **3. Cohérence :**
- Palette unifiée dans toute l'application
- Transitions fluides entre modes
- Éléments interactifs clairement identifiables

### **4. Flexibilité :**
- S'adapte au mode sombre/clair
- Facilement extensible
- Classes utilitaires réutilisables

## 🎨 **Exemples d'Utilisation**

### **Bouton Principal :**
```html
<button class="bg-black text-white hover:bg-gray-800 border border-gold-500 px-6 py-2 rounded-full">
  Créer un cours
</button>
```

### **Carte avec Accent :**
```html
<div class="bg-white dark:bg-black border border-gold-200 dark:border-gold-800 rounded-lg p-6">
  <h3 class="text-gold-600 dark:text-gold-400">Titre</h3>
  <p class="text-gray-700 dark:text-gray-300">Contenu</p>
</div>
```

### **Navigation Active :**
```html
<a class="text-gold-600 dark:text-gold-400 font-medium">
  Page active
</a>
```

## 🔧 **Personnalisation**

Pour modifier le thème, ajustez les variables dans :
1. `tailwind.config.js` - Couleurs principales
2. `app/globals.css` - Variables CSS et styles globaux
3. Composants individuels - Styles spécifiques

Le thème est maintenant appliqué à tout votre site web ! 🎉 