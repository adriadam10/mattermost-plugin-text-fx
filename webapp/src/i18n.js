const STRINGS = {
    en: {
        button: 'Text effects',
        effects: 'Effects',
        help: 'Help',
        color: 'Colour',
        light: 'Light',
        motion: 'Motion',
        gradient: 'Gradient',
        custom: 'Other',
        sample: 'Hello!',
        apply: 'Apply',
        applyHint: 'Wraps the selected text, or inserts the tag where the cursor is.',
        rainbow: 'Rainbow', fire: 'Fire', glow: 'Glow', neon: 'Neon', shine: 'Shine',
        wave: 'Wave', bounce: 'Bounce', shake: 'Shake', pulse: 'Pulse', blink: 'Blink', typewriter: 'Typewriter',
        helpIntro: 'Wrap text in a tag: {effect}text{/}. Click an example to use it.',
        helpNotes: [
            'One effect of each kind per piece: colour (a colour, a gradient, rainbow, fire), light (glow, neon, shine) and motion (the rest). Combine them with +.',
            'Tags can be nested: {red}red and {wave}wavy{/}{/}. A tag left open lasts to the end of the message.',
            'Colours: red orange yellow green cyan blue purple pink brown gray black white gold silver, or #rgb / #rrggbb. Gradient: red>blue (up to 4).',
            'Editing the message shows the tags again. Inside code they do nothing.',
            'The mobile apps show the text without the tags and without effects. /fx shows this help in any channel.',
        ],
    },
    es: {
        button: 'Efectos de texto',
        effects: 'Efectos',
        help: 'Ayuda',
        color: 'Color',
        light: 'Luz',
        motion: 'Movimiento',
        gradient: 'Degradado',
        custom: 'Otro',
        sample: '¡Hola!',
        apply: 'Aplicar',
        applyHint: 'Envuelve el texto seleccionado o mete la etiqueta donde está el cursor.',
        rainbow: 'Arcoíris', fire: 'Fuego', glow: 'Brillo', neon: 'Neón', shine: 'Destello',
        wave: 'Ola', bounce: 'Rebote', shake: 'Temblor', pulse: 'Latido', blink: 'Parpadeo', typewriter: 'Máquina',
        helpIntro: 'Envuelve el texto en una etiqueta: {efecto}texto{/}. Pulsa un ejemplo para usarlo.',
        helpNotes: [
            'Un efecto de cada tipo por trozo: color (un color, degradado, rainbow, fire), luz (glow, neon, shine) y movimiento (el resto). Se combinan con +.',
            'Se pueden anidar: {red}rojo y {wave}con ola{/}{/}. Una etiqueta sin cerrar dura hasta el final del mensaje.',
            'Colores: red orange yellow green cyan blue purple pink brown gray black white gold silver (o rojo, azul…), o #rgb / #rrggbb. Degradado: red>blue (hasta 4).',
            'Los efectos también en castellano: arcoiris, fuego, brillo, destello, ola, rebote, temblor, latido, parpadeo, maquina.',
            'Al editar el mensaje vuelven a salir las etiquetas. Dentro de código no hacen nada.',
            'En la app móvil se ve el texto sin etiquetas y sin efectos. /fx muestra esta ayuda en cualquier canal.',
        ],
    },
};

// Every example of the help tab: the spec it applies and what it is.
export const EXAMPLES = [
    ['#e53935', {en: 'solid colour', es: 'color fijo'}],
    ['#ff8800', {en: 'hex colour', es: 'color hexadecimal'}],
    ['#e53935>#1e88e5', {en: 'gradient', es: 'degradado'}],
    ['rainbow', {en: 'animated rainbow', es: 'arcoíris animado'}],
    ['fire', {en: 'fire', es: 'fuego'}],
    ['#1e88e5+glow', {en: 'breathing glow', es: 'brillo que respira'}],
    ['#ec407a+neon', {en: 'flickering neon', es: 'neón que parpadea'}],
    ['#ffb300+shine', {en: 'sweeping shine', es: 'destello que recorre'}],
    ['wave', {en: 'wave', es: 'ola'}],
    ['bounce', {en: 'bounce', es: 'rebote'}],
    ['shake', {en: 'shake', es: 'temblor'}],
    ['pulse', {en: 'pulse', es: 'latido'}],
    ['blink', {en: 'blink', es: 'parpadeo'}],
    ['typewriter', {en: 'typewriter', es: 'máquina de escribir'}],
    ['rainbow+wave', {en: 'combined with +', es: 'combinados con +'}],
];

export function language(locale) {
    return String(locale || '').startsWith('es') ? 'es' : 'en';
}

export function translator(locale) {
    const strings = STRINGS[language(locale)];
    return (key) => strings[key] ?? STRINGS.en[key] ?? key;
}
