# Tutorial: Como Conectar o Formulário CI ao Google Sheets

Para receber as candidaturas automaticamente no teu Google Sheets de forma segura e rápida, vais usar o "Google Apps Script". Tens total razão: o código anterior estava incompleto para as 13 perguntas do teu formulário Multi-Step. 

Agora o código reflete **exatamente as 13 perguntas** + Timestamp + UTMs (Total de 17 colunas).

### Passo 1: Criar a tua Folha de Excel (Google Sheets)
1. Abre o teu Google Drive (ou https://sheets.google.com).
2. Cria uma folha em branco e dá um nome como "Candidaturas - Mentoria CI".
3. Na primeira linha (Célula A1 até Q1), escreve os cabeçalhos por esta ordem exata:
   `Data/Hora | Nome | Telefone | WhatsApp | Área | Tempo | Situação | Facturação | Reuniões/Mês | Conversão | Reacção ao Preço | Maior Obstáculo | Investiu Antes | Condições | UTM Source | UTM Medium | UTM Campaign`

### Passo 2: Adicionar o Código (Apps Script)
1. No menu no topo superior da tua folha, clica em **Extensões** > **Apps Script**.
2. Vai abrir um separador novo. Lá dentro, apaga tudo o que existir e **cola este código completo**:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // Lê o payload JSON vindo do teu site
    var data = JSON.parse(e.postData.contents);
    
    // Insere os dados exactos na próxima linha livre (17 Colunas)
    var rowData = [
      data.timestamp || new Date(),
      data.nome || "",
      data.telefone || "",
      data.whatsapp || "",
      data.area || "",
      data.tempo || "",
      data.situacao || "",
      data.faturamento || "",
      data.reunioes_mes || "",
      data.taxa_fechamento || "",
      data.reacao_preco || "",
      data.obstaculo || "",
      data.investiu_antes || "",
      data.condicoes || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || ""
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "sucesso"})).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "erro", "mensagem": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Clica no ícone de "Guardar" (ícone de um disco, ou ctrl+s).

### Passo 3: Publicar e Obter o Link (Webhook)
1. No canto superior direito da janela do script, clica em **Implementar** (Deploy) > **Nova Implementação** (New deployment).
2. Clica na roda dentada (⚙️) ao lado de "Selecione o tipo" e escolhe **Aplicação Web**.
3. Preenche assim:
   - **Descrição:** "WebHook Candidaturas CI"
   - **Executar como:** *Mim (O teu email)*
   - **Quem tem acesso:** *Qualquer pessoa* (Isto é CRUCIAL, caso contrário o site é bloqueado de enviar os dados).
4. Clica em **Implementar**.
5. *Nota:* o Google vai pedir para "Autorizar Acesso". Avança, escolhe o teu e-mail, clica em Avançado/Advanced > "Ir para Projeto sem Título (Inseguro)" e clica em Permitir.
6. A seguir terás um ecrã com um **URL da aplicação da Web**. 
   - **Copia esse link inteiro!** (começa com https://script.google.com/macros/s/...)

### Passo 4: Colar o Link no Website
Vai ao ficheiro local da tua landing page: `assets/js/script.js`.
Procura a **Linha 195** que diz:
```javascript
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz_XXXXXXXXXX/exec"; 
```
Substitui as aspas pelo teu novo URL válido! Salva o ficheiro.

### Feito! Teste.
Vai ao site, preenche uma candidatura na totalidade e envia. De seguida volta ao teu Google Sheets e vais ver a fila nova a aparecer automaticamente em tempo real e perfeitamente catalogada coluna por coluna!
