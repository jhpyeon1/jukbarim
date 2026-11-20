/* 적바림 설정. 구글 시트 '상품' 탭을 [파일 > 공유 > 웹에 게시 > 상품 / CSV]로 게시한 주소를 넣으면
   리스트와 추천이 그 시트를 읽습니다. 비워 두면 사이트에 내장된 목록(db.js)을 씁니다. */
window.JUKBARIM_CONFIG = {
  sheetCsv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQaIeJJ-m-R8uNu-AKwPna4fxoWOHhlqPtiZQTkiqdiu9IcosNkTalmLFRDeDNc1oi_8au5Oj4wFGYH/pub?gid=845084011&single=true&output=csv',
  refreshMinutes: 10
};
