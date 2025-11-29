import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Create a new JSZip instance
    const zip = new JSZip()
    
    // Get language from query parameter or referer header
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'en'
    
    // Define language-specific PDF file paths
    const pdfFiles = {
      'en': 'investors-deck.pdf',
      'es': 'investors-deck_es.pdf',
      'zh': 'investors-deck_zh.pdf',
      'fr': 'investors-deck.pdf' // Fallback to English for now
    }
    
    const pdfFileName = pdfFiles[lang as keyof typeof pdfFiles] || pdfFiles['en']
    const pdfPath = path.join(process.cwd(), 'public', 'downloads', pdfFileName)
    
    // Check if the PDF file exists
    if (!fs.existsSync(pdfPath)) {
      // Fallback to English if language-specific PDF doesn't exist
      const fallbackPath = path.join(process.cwd(), 'public', 'downloads', 'investors-deck.pdf')
      if (!fs.existsSync(fallbackPath)) {
        return NextResponse.json(
          { error: 'PDF file not found' },
          { status: 404 }
        )
      }
      // Use fallback
      const pdfBuffer = fs.readFileSync(fallbackPath)
      zip.file('Cabo_Negro_Investors_Deck.pdf', new Uint8Array(pdfBuffer))
    } else {
      // Read the language-specific PDF file
      const pdfBuffer = fs.readFileSync(pdfPath)
      
      // Add the PDF to the zip file with language-specific naming
      const zipFileName = lang === 'en' ? 'Cabo_Negro_Investors_Deck.pdf' : 
                         lang === 'es' ? 'Cabo_Negro_Deck_Inversionistas.pdf' :
                         lang === 'zh' ? 'Cabo_Negro_Investors_Deck_CN.pdf' :
                         'Cabo_Negro_Deck_Investisseurs.pdf'
      zip.file(zipFileName, new Uint8Array(pdfBuffer))
    }
    
    // Add a README file with language-specific information
    const readmeContents = {
      'en': `CABO NEGRO - STRATEGIC INVESTMENT IN GREEN HYDROGEN & GLOBAL TRADE
INVESTOR DECK 2025

QUICK NOTICE:
This material and information contained herein is confidential and proprietary. 
The information and data presented is current as of 2025 and is subject to change.

PROJECT OWNERSHIP & RESPONSIBILITY:

Inversiones PPG SpA (PPG): Maritime concession applicant in process (CM61260)

Inmobiliaria Patagon Valley SpA (PV): ~33 hectares. Owner is a Private Investment Fund. 
AWS and GTD are installed here. Original concept was to focus on a technology park.

Inversiones A&J Limitada (A&J): Subdivided land in lots from 5,000 m².

Inversiones J&P Limitada (J&P): Port Zone. Now divided into separate companies per land plot. 
The continuing J&P would be directly linked to port project development with PPG. 
J&P 2 and J&P 3 as expansion options for the logistics/port zone.

Inmobiliaria Cabo Negro Dos (CN2): Result of J&P subdivision. ~173 hectares, 
without subdivision.

INVESTOR DECK CONTENTS:
- Strategic Gateway Location
- H2V Opportunity Analysis  
- Industrial Park Specifications
- Maritime Terminal Development
- Regulatory Advantages
- Wind Power Potential

For more information, visit: https://cabonegro.com

© 2025 Cabo Negro. All rights reserved.`,
      'es': `CABO NEGRO - INVERSIÓN ESTRATÉGICA EN HIDRÓGENO VERDE Y COMERCIO GLOBAL
DECK DE INVERSIONISTAS 2025

AVISO RÁPIDO:
Este material e información contenida es confidencial y de propiedad privada.
La información y datos presentados son actuales al 2025 y están sujetos a cambios.

PROPIEDAD Y RESPONSABILIDAD DEL PROYECTO:

Inversiones PPG SpA (PPG): Titular de la solicitud de concesión marítima en trámite (CM61260)

Inmobiliaria Patagon Valley SpA (PV): 33 hectáreas aprox. El dueño de esta inmobiliaria 
es un Fondo de Inversión Privado. Aquí está instalado AWS y GTD. La idea original era 
darle un enfoque de parque tecnológico.

Inversiones A&J Limitada (A&J): terrenos subdivididos en lotes desde los 5.000 m².

Inversiones J&P Limitada (J&P): Zona Portuaria. Ahora fue dividida en una sociedad 
por cada terreno. La J&P continuadora estaría directamente ligada al desarrollo del 
proyecto portuario con PPG. J&P 2 y J&P 3 como opciones de ampliación de la zona 
logística/portuaria.

Inmobiliaria Cabo Negro Dos (CN2): resultante de la subdivisión de J&P. Son 173 
hectáreas aprox., sin subdivisión.

CONTENIDO DEL DECK DE INVERSIONISTAS:
- Ubicación de Puerta de Entrada Estratégica
- Análisis de Oportunidad H₂V
- Especificaciones del Parque Industrial
- Desarrollo del Terminal Marítimo
- Ventajas Regulatorias
- Potencial de Energía Eólica

Para más información, visite: https://cabonegro.com

© 2025 Cabo Negro. Todos los derechos reservados.`,
      'fr': `CABO NEGRO - INVESTISSEMENT STRATÉGIQUE DANS L'HYDROGÈNE VERT ET LE COMMERCE MONDIAL
DECK D'INVESTISSEURS 2025

AVIS RAPIDE:
Ce matériel et les informations qu'il contient sont confidentiels et propriétaires.
Les informations et données présentées sont à jour en 2025 et peuvent être modifiées.

PROPRIÉTÉ ET RESPONSABILITÉ DU PROJET:

Inversiones PPG SpA (PPG): Demandeur de concession maritime en cours (CM61260)

Inmobiliaria Patagon Valley SpA (PV): ~33 hectares. Le propriétaire est un Fonds d'investissement privé.
AWS et GTD sont installés ici. Le concept original était de se concentrer sur un parc technologique.

Inversiones A&J Limitada (A&J): Terres subdivisées en lots à partir de 5 000 m².

Inversiones J&P Limitada (J&P): Zone portuaire. Maintenant divisée en sociétés séparées par parcelle.
La J&P continue serait directement liée au développement du projet portuaire avec PPG.
J&P 2 et J&P 3 comme options d'expansion pour la zone logistique/portuaire.

Inmobiliaria Cabo Negro Dos (CN2): Résultat de la subdivision J&P. ~173 hectares,
sans subdivision.

CONTENU DU DECK D'INVESTISSEURS:
- Emplacement de la porte d'entrée stratégique
- Analyse des opportunités H₂V
- Spécifications du parc industriel
- Développement du terminal maritime
- Avantages réglementaires
- Potentiel éolien

Pour plus d'informations, visitez: https://cabonegro.com

© 2025 Cabo Negro. Tous droits réservés.`,
      'zh': `卡波内格罗 - 绿色氢气和全球贸易的战略投资
投资者演示文稿 2025

快速通知：
本材料及所含信息为机密和专有信息。
所提供的信息和数据截至2025年，可能会发生变化。

项目所有权和责任：

Inversiones PPG SpA (PPG)：海事特许权申请进行中 (CM61260)

Inmobiliaria Patagon Valley SpA (PV)：约33公顷。所有者是私人投资基金。
AWS和GTD安装在此处。原始概念是专注于技术园区。

Inversiones A&J Limitada (A&J)：从5,000平方米开始细分的土地。

Inversiones J&P Limitada (J&P)：港口区。现在按地块分为独立公司。
继续的J&P将与PPG直接关联港口项目开发。J&P 2和J&P 3作为
物流/港口区的扩展选项。

Inmobiliaria Cabo Negro Dos (CN2)：J&P细分的产物。约173公顷，
无细分。

投资者演示文稿内容：
- 战略门户位置
- H₂V 机会分析
- 工业园规格
- 海事终端开发
- 监管优势
- 风力发电潜力

更多信息，请访问：https://cabonegro.com

© 2025 卡波内格罗。保留所有权利。`
    }
    
    const readmeContent = readmeContents[lang as keyof typeof readmeContents] || readmeContents['en']
    const readmeFileName = lang === 'en' ? 'README.txt' : 
                          lang === 'es' ? 'LEEME.txt' : 
                          lang === 'zh' ? '说明.txt' :
                          'LISEZMOI.txt'
    zip.file(readmeFileName, readmeContent)
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Set response headers for file download with language-specific naming
    const zipFileName = lang === 'en' ? 'Cabo_Negro_Investors_Deck.zip' : 
                       lang === 'es' ? 'Cabo_Negro_Deck_Inversionistas.zip' :
                       lang === 'zh' ? 'Cabo_Negro_Investors_Deck_CN.zip' :
                       'Cabo_Negro_Deck_Investisseurs.zip'
    
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="${zipFileName}"`)
    headers.set('Content-Length', zipBuffer.length.toString())
    
    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers,
    })
    
  } catch (error) {
    console.error('Error creating zip file:', error)
    return NextResponse.json(
      { error: 'Failed to create download file' },
      { status: 500 }
    )
  }
}
