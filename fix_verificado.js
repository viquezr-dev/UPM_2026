/**
 * Script para diagnosticar y corregir el campo VERIFICADO en eml.geojson
 * Ejecutar en Node.js: node fix_verificado.js
 */

const fs = require('fs');

try {
    // Leer el archivo GeoJSON
    const data = JSON.parse(fs.readFileSync('eml.geojson', 'utf8'));
    
    if (!data.features || !Array.isArray(data.features)) {
        console.error('❌ Archivo GeoJSON inválido');
        process.exit(1);
    }
    
    console.log(`📊 Analizando ${data.features.length} features...`);
    
    // Estadísticas
    let stats = {
        total: 0,
        conVerificado: 0,
        verificadoSI: 0,
        verificadoNO: 0,
        sinVerificado: 0,
        valoresUnicos: new Set()
    };
    
    // Analizar cada feature
    data.features.forEach((feature, index) => {
        stats.total++;
        
        if (feature.properties) {
            const verificado = feature.properties.VERIFICADO;
            
            if (verificado === undefined || verificado === null) {
                stats.sinVerificado++;
            } else {
                stats.conVerificado++;
                stats.valoresUnicos.add(String(verificado).trim().toUpperCase());
                
                if (String(verificado).trim().toUpperCase() === 'SI') {
                    stats.verificadoSI++;
                } else if (String(verificado).trim().toUpperCase() === 'NO') {
                    stats.verificadoNO++;
                }
            }
        }
    });
    
    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`   ✅ Total features: ${stats.total}`);
    console.log(`   🔍 Con campo VERIFICADO: ${stats.conVerificado}`);
    console.log(`   ❌ Sin campo VERIFICADO: ${stats.sinVerificado}`);
    console.log(`   ✅ VERIFICADO = SI: ${stats.verificadoSI}`);
    console.log(`   ❌ VERIFICADO = NO: ${stats.verificadoNO}`);
    console.log(`   📋 Valores únicos encontrados: ${Array.from(stats.valoresUnicos).join(', ')}`);
    
    // Normalizar si es necesario
    if (stats.conVerificado > 0) {
        console.log('\n🔄 Normalizando valores VERIFICADO...');
        
        let cambios = 0;
        data.features.forEach(feature => {
            if (feature.properties && feature.properties.VERIFICADO) {
                const val = String(feature.properties.VERIFICADO).trim().toUpperCase();
                if (val === 'SI' || val === 'SÍ') {
                    feature.properties.VERIFICADO = 'SI';
                } else if (val === 'NO') {
                    feature.properties.VERIFICADO = 'NO';
                }
            }
        });
        
        // Guardar archivo normalizado
        fs.writeFileSync('eml_normalizado.geojson', JSON.stringify(data, null, 2));
        console.log('✅ Archivo normalizado guardado como: eml_normalizado.geojson');
        console.log('\n💡 INSTRUCCIONES:');
        console.log('   1. Renombra eml.geojson a eml_backup.geojson (seguridad)');
        console.log('   2. Renombra eml_normalizado.geojson a eml.geojson');
        console.log('   3. Recarga la página web');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
