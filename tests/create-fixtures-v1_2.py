from pathlib import Path
from datetime import datetime
import openpyxl
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

out = Path(__file__).parent / 'fixtures-v1_2'
out.mkdir(exist_ok=True)
(out/'fatura.csv').write_text('Data;Descrição;Valor;Parcela;ID\n10/11/2026;ALBERTO FABIANO;100,01;3/10;csv-1\n11/11/2026;JR BACAN;50,00;;csv-2\n', encoding='utf-8-sig')
(out/'extrato.csv').write_text('Data;Descrição;Valor;Tipo;ID\n12/11/2026;ALBERTO FABIANO;-25,01;debito;bank-1\n13/11/2026;JR BACAN;15,02;credito;bank-2\n', encoding='utf-8-sig')
wb=openpyxl.Workbook()
ws=wb.active
ws.title='Fatura'
ws.append(['Fatura sintetica para testes'])
ws.append(['Data','Descrição','Valor','Parcela','ID'])
ws.append([datetime(2026,11,12),'FLEX ATACAREJO',1234.56,'15/24','xlsx-1'])
ws.append([datetime(2026,11,13),'EST. COMERCIAL',-45.67,'','xlsx-2'])
for row in (3,4):
    ws.cell(row,1).number_format='dd/mm/yyyy'
    ws.cell(row,3).number_format='#,##0.00'
ws2=wb.create_sheet('Outra aba')
ws2.append(['Data','Descrição','Valor'])
ws2.append(['14/11/2026','MIX VALE',20.00])
wb.save(out/'fatura.xlsx')

c=canvas.Canvas(str(out/'fatura-textual.pdf'),pagesize=A4)
c.setTitle('Fatura sintetica Nat Finance')
c.setFont('Helvetica',12)
c.drawString(40,800,'FATURA SINTETICA - NAO CONTEM DADOS REAIS')
c.drawString(40,765,'14/11/2026 ALBERTO FABIANO 1/6 100,00')
c.drawString(40,740,'15/11/2026 JR BACAN 51,25')
c.save()

im=Image.new('RGB',(1200,400),'white')
d=ImageDraw.Draw(im)
try: font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',36)
except OSError: font=ImageFont.load_default()
d.text((30,40),'DOCUMENTO SINTETICO - NAT FINANCE',font=font,fill='black')
d.text((30,130),'16/11/2026 ALBERTO FABIANO 35,90',font=font,fill='black')
d.text((30,210),'17/11/2026 JR BACAN 20,00',font=font,fill='black')
im.save(out/'comprovante.png')
im.save(out/'comprovante.jpg')
c=canvas.Canvas(str(out/'fatura-digitalizada.pdf'),pagesize=A4)
c.drawImage(ImageReader(im),30,550,width=540,height=180)
c.save()
(out/'texto-sem-ano.txt').write_text('10/11 ALBERTO FABIANO 12,34\n11/11/2026 JR BACAN 25,00',encoding='utf-8')
print('Fixtures sintéticas criadas em',out)
