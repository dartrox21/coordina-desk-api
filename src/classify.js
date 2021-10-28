const { Classifier } = require('ml-classify-text')

const classifier = new Classifier()



/**
 * configurations
 * Schema(variableName:boolean, status:boolean)
 * 
 * // isTrained = cuando inicie el entrenamiento del nlp ponerlo como false, cuando termine ponerlo como true
 * configuracion importante: cuando se cree la db se debe setar isTrained a false para que haga el proceso de entrenamiento 1 vez
 * En cuanto se levanta la applicacion se lee si isTrained=true si es asi ya no se requiere entrenar pueso que 
 * En front hay una parte que dice [Entrenado] o [Entrenando] Se hace el request para ver si la variable esta entrenada o no al inicio.
 * Si esta dentro de la pantalla de faqs y categorias se hace el request cada 5 minutos.
 * Poner un simbolito de refresh al de [Entrenado] para hacer la peticion(por si no se quiere esperar a los 5 mniutos)
 * 
 * // isClassified
 */


/**
 * Classifier
 * Schema(category:string);
 */


const dbData = [
    {category: 'Proyecto modular'}
];
 dbData.forEach(data => {
     classifier.train([data.category], `${data.category}`);
 });

let predictions = classifier.predict('Cuando se entrega el proyecto modular?')
 
if (predictions.length) {
    predictions.forEach(prediction => {
        console.log(`${prediction.label} (${prediction.confidence})`)
    })
} else {
    console.log('No predictions returned')
}