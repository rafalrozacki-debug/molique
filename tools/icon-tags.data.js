/**
 * molique - Polish and German search stems for the Phosphor icon gallery
 *
 * One line per English word: en|pl stems|de stems. The English word is a token
 * of an icon name or a Phosphor tag; tools/gen-icon-gallery.js looks each one up
 * (trying the singular and the base form too) and writes the stems into
 * data-tags of the card. Hand-written stems of single icons live in
 * tools/icon-tags.overrides.json and always stay.
 *
 * HOW TO WRITE A STEM. molique-table-search.js matches both ways: a tag matches
 * when it starts with the typed word, and when the typed word starts with a tag
 * of 3+ letters. So:
 *  - cut before the inflected ending: "klodk" finds klodka, klodki, klodke;
 *  - a word that changes inside gets its forms: "pies psa psy", "kota koty";
 *  - a short stem is a trap, because the typed word may merely begin with it:
 *    the tag "kot" would light up the cat for "kotwica". Write "kota koty" - the
 *    word "kot" still finds them, since a tag may start with what was typed;
 *  - no diacritics, the module strips them on both sides (l for l with stroke,
 *    ss for sharp s, u for u umlaut).
 * npm run test:icon-gallery reports stems that collide with an unrelated word.
 */

export default `
acorn|zoladz|eichel
address|adres|adress anschrift
afternoon|popoludni|nachmittag
aid|pomoc|hilfe
air|powietrz|luft
airplane|samolot|flugzeug
airplay|airplay|airplay
alarm|alarm budzik|alarm wecker
alien|kosmit obcy ufo|alien ausserirdisch
align|wyrown|ausricht
all|wszystk|alle
ambulance|karetk ambulans pogotow|krankenwagen rettungswagen
anchor|kotwic|anker
angle|katy katomierz|winkel
angry|zlosc gniew zlosliw|wutend wut
apartment|mieszkan apartament|wohnung apartment
aperture|przyslon|blende
app|aplikac|anwendung
approximate|przybliz|ungefahr
arc|luku luki|bogen
archive|archiw|archiv
area|obszar|bereich flache
armchair|fotel|sessel
arms|ramion ramie|arme
arrow|strzal|pfeil
article|artykul|artikel
ascending|rosnac|aufsteig
asclepius|eskulap|askulap
asterisk|gwiazdk|sternchen
at|malpa malpk|klammeraffe
atom|atom|atom
audio|dzwiek audio|audio
avocado|awokado|avocado
axe|siekier topor|axt beil
baby|dziecko dzieci niemowl bobas|baby saugling
back|wstecz cofn tylu tylem|zuruck
background|tlem tla|hintergrund
backpack|plecak|rucksack
backspace|usun cofn|rucktaste
badge|identyfikator plakietk odznak|ausweis abzeichen
bag|torb|tasche
ball|pilk|ball
balloon|balon|ballon
bandaids|plaster opatrun|pflaster
bank|bank|bank
banner|baner|banner
bar|pasek slupek|balken leiste
barbell|sztang silown|hantel langhantel
barcode|kreskow|strichcode barcode
barn|stodol|scheune
barricade|barier blokad|barrikade absperr
baseball|baseball|baseball
basket|koszyk|korb
basketball|koszykow|basketball
bathtub|wann lazien|badewanne
battery|bateri akumulator|batterie akku
beach|plaz|strand
bean|ziarn fasol|bohne
beanie|czapk|mutze
bed|lozk|bett
beer|piwo piwa|bier
beetle|chrzaszcz zuka zuki|kafer
bell|dzwon|glock klingel
belt|pasek|gurtel
bend|zakret|kurve biegung
bicycle|rower|fahrrad
bike|rower|fahrrad
binary|binarn|binar
binoculars|lornet|fernglas
biohazard|zagrozen biolog|biogefahr
bird|ptak ptas|vogel
blank|pusta pusty puste|leer
block|bloku bloki|block
blueprint|projekt planu plany|bauplan
bluetooth|bluetooth|bluetooth
boat|lodz lodk lodzi|boot
bomb|bomb|bombe
bone|koscia kosciec|knochen
book|ksiaz ksiaze|buches bucher
bookmark|zaklad|lesezeichen
boot|buty buta butow kozak|stiefel
bottle|butelk|flasche
bottom|dolu dolna dolny|unten
boules|bule|boule
bounding|ramk obrys|rahmen
bowl|misk|schussel
bowling|kregl bowling|kegel bowling
box|pudel karton|kiste karton schachtel
boxing|boks|boxen
brackets|nawias|klammer
brain|mozg|gehirn hirn
branch|galaz galez|zweig
brandy|koniak brandy|weinbrand brandy
bread|chleb pieczyw|brot
break|przerw|bruch
bridge|mostu mosty most|brucke
briefcase|teczk aktowk walizk|aktentasche
broad|szerok|breit
broadcast|transmisj nadaw|sendung ubertrag
broken|zepsut uszkodz|kaputt defekt
broom|miotl|besen
browser|przegladark|browser
brush|pedzel szczotk|pinsel burste
btc|bitcoin|bitcoin
bucket|wiadr|eimer
bug|robak blad|kafer fehler
building|budyn|gebaude
bulldozer|spychacz buldozer|planierraupe bulldozer
bullets|wypunkt|aufzahl
bus|autobus|bus
butterfly|motyl|schmetterling
button|przycisk|taste knopf schaltfl
cable|kabel kolejk linow|kabel seilbahn
cactus|kaktus|kaktus
cake|ciast tort|kuchen torte
calculator|kalkulator|rechner taschenrechner
calendar|kalendarz terminarz data daty|kalender datum termin
call|telefon rozmow polacz|anruf telefon
camera|aparat kamer|kamera
campfire|ognisk|lagerfeuer
can|kanister puszk|kanister dose
cap|czapk|kappe mutze
captioning|napis|untertitel
car|samochod auto|auto wagen
card|karta karty karte kartk|karte
cardholder|portfel etui|kartenetui
cardinal|kierunk|himmelsricht
caret|daszek rozwin|caret
carriage|wozek|kinderwagen
carrot|marchew|karotte mohre
cart|wozek koszyk|einkaufswagen
cash|gotowk kasa kase kasie|bargeld kassen
cassette|kaset|kassette
castle|zamek zamku|burg schloss
cat|kota koty kotek kotka|katze
cell|komork|mobil zelle
center|srodek srodk|mitte zentr
certificate|certyfikat dyplom|zertifikat urkunde
chair|krzesl|stuhl
chalkboard|tablic|tafel
champagne|szampan|sekt champagner
charging|ladowa|laden ladung
chart|wykres|diagramm
chat|czat rozmow|chat
check|ptaszek ptaszk fajk zaznacz potwierdz|haken hakchen bestatig
checkerboard|szachownic|schachbrett
checkered|kratk szachownic|kariert
cheers|toast|prost
cheese|sera serek serem|kase
chef|kucharz kuchni|koch kochmutze
cherries|wisni czeresn|kirsche
chest|skrzyni kufer|truhe
chevron|szewron|chevron
chip|chip zeton|chip
church|kosciol kosciel|kirche
cigarette|papieros|zigarette
circle|kolko kolka okrag kolowe|kreis
circuit|obwod|schaltkreis
circuitry|obwod elektron|schaltung
city|miast|stadt
clapping|klask oklask|klatsch applaus
click|klik|klick
clipboard|schowek podklad|zwischenablage klemmbrett
clipping|wycinek|ausschnitt
clock|zegar|uhr
clockwise|zegar obrot|uhrzeiger
closed|zamkn|geschlossen
cloud|chmur|wolke
clover|koniczyn|klee
club|trefl klub|kreuz club
cny|juan|yuan
coat|plaszcz wieszak|mantel
code|kodu kody program|code
coffee|kawa kawy kawe|kaffee
coin|monet|munze
cold|zimn mroz|kalt
columns|kolumn|spalte
command|polecen komend|befehl
commit|zatwierdz commit|commit
compass|kompas cyrkiel|kompass zirkel
computer|komputer|computer rechner
cone|pacholek stozek|kegel hutchen
conference|konferenc wideorozmow|konferenz
confetti|konfetti|konfetti
connected|polacz|verbunden
contactless|zblizeni bezstyk|kontaktlos
container|kontener|container
control|kontrol sterow|steuer kontrolle
controller|kontroler|controller
cookie|ciastk herbatnik|keks
cooking|gotowan kucharz|kochen
copy|kopi|kopie kopier
copyleft|copyleft|copyleft
copyright|prawa autor|urheberrecht
corners|naroz rogi rogu|ecke
couch|kanap sofa|sofa couch
countdown|odlicz|countdown
counter|licznik|zahler
court|boisk kort|spielfeld platz
cow|krowa krowy|kuh
cowboy|kowboj|cowboy
cpu|procesor|prozessor
crack|pekn|riss
crane|dzwig zuraw|krane kranen
cream|krem|creme
credit|kredyt platn|kreditkarte
crescent|polksiezyc|halbmond
cricket|krykiet|cricket
crop|kadr przytn|zuschneid
cross|krzyz|kreuz
crosshair|celownik|fadenkreuz
crown|koron|krone
cube|kostk szescian|wurfel
curly|klamrow|geschweift
currency|walut|wahrung
cursor|kursor|zeiger cursor
curve|krzyw|kurve
cylinder|walec walca|zylinder
dashed|przerywan|gestrichelt
dashes|kresk|strich
database|bazy baza danych dane|datenbank
david|dawid|david
definition|rozdzielcz|auflosung
deposit|wplat|einzahl
descending|malejac|absteig
desk|biurk|schreibtisch
desktop|komputer stacjonarn pulpit|desktop
detective|detektyw|detektiv
device|urzadzen|gerat
diamond|diament romb karo|diamant raute
dice|kostk|wurfel
diff|roznic|unterschied
dim|przyciemn|dimm
disc|plyt dysk|scheibe
disco|dyskotek|disko
disconnect|rozlacz|trennen aufleg
disk|dysk|diskette
divide|dziel|teilen
dna|dna gene|dna
doc|dokument|dokument
dog|piesek psa psy psem psiak|hund
dollar|dolar|dollar
donut|pierscien|donut ring
door|drzwi|turen ture
dot|kropk|punkt
double|podwojn|doppel
down|dolu dolna dolny|unten runter
download|pobier pobra sciag|herunterlad download
dress|sukien|kleid
dresser|komod|kommode
drive|dysk|laufwerk
droid|android|android
drone|dron|drohne
drop|kropl|tropfen
dryer|suszark|fohn
ear|ucho ucha uszy sluch|ohr
east|wschod|ost
egg|jajk jajo jaja|ei
eject|wysun|auswerf
elbow|lokiec kolank|ellbogen
elevator|winda windy|aufzug fahrstuhl
empty|pusta pusty puste|leer
engine|silnik|motor
envelope|koper|umschlag brief
equal|rown|gleich
equalizer|korektor equalizer|equalizer
eraser|gumk|radierer
escalator|schody ruchome|rolltreppe
eth|ethereum|ethereum
eur|euro|euro
evergreen|choink swierk|tanne
exam|egzamin test|prufung
exclamation|wykrzyknik|ausrufezeichen
exclude|wyklucz|ausschliess
export|eksport|export
extinguisher|gasnic|feuerloscher
eye|oko oka oczy|auge
eyedropper|pipet|pipette
eyeglasses|okular|brille
face|twarz|gesicht
factory|fabryk|fabrik
faders|suwak|regler
fallout|schron|schutzraum
fan|wentylator wiatrak|lufter ventilator
farm|farm gospodarstw|bauernhof
fast|szybk|schnell
fat|gruba gruby|dick
feather|pioro piora piorem|feder
female|kobiet|weiblich
filament|zarnik|gluhfaden
file|plik|datei
film|film|film
fine|drobn|fein
fingerprint|odcisk papilar|fingerabdruck
fire|ogien ognia pozar|feuer
first|pierwsz|ersten
fish|ryba ryby rybk|fisch
fist|piesc|faust
fix|naprawa utrwal|fix
flag|flag|flagge fahne
flame|plomien plomi|flamme
flashlight|latark|taschenlampe
flask|kolba kolby|kolben
flight|lotu loty lotnisk|flug
flip|odwroc|spiegel
floppy|dyskietk|diskette
flow|przeplyw|fluss
flower|kwiat|blume
flying|latajac|fliegend
focus|ostrosc|fokus
fog|mgla mgly|nebel
fold|zagiec|falz
folded|zlozon|gefaltet
folder|folder katalog|ordner
food|jedzen|essen
football|futbol|football
footprints|slady stop|fussspuren
foreground|pierwszy planu|vordergrund
fork|widelec rozwidl|gabel
forward|naprzod dalej|vorwarts
frame|ramk|rahmen
front|przod|vorne
full|pelny pelna|voll
function|funkcj|funktion
funnel|lejek filtr|trichter filter
game|gier gry grac|spiel
garage|garaz|garage
gas|gazu paliw|gas benzin
gauge|wskaznik miernik|anzeige
gavel|mlotek sedzi|richterhammer
gbp|funta funt|pfund
gear|zebatk|zahnrad
gender|plec|geschlecht
ghost|duch|geist
gift|prezent|geschenk
glass|szklan lampk|glas
globe|globus swiata swiecie|globus welt
glove|rekawic|handschuh
goggles|gogle|brille
golf|golf|golf
grabbing|chwyt|greifen
gradient|gradient|verlauf
graduation|absolw|abschluss
grains|zboz|getreide
graph|graf|graph
graphics|graficzn|grafik
greater|wieksz|grosser
grid|siatk|raster
guitar|gitar|gitarre
hair|wlos|haar
half|polow|halb
hamburger|hamburger|hamburger
hammer|mlot|hammer
hand|reka reki dlon|hande handen
handbag|torebk|handtasche
handshake|uscisk|handedruck
hanger|wieszak|kleiderbugel
happy|wesol szczesl|frohlich
hard|twardy|hart
hash|krzyzyk hash|raute
hat|kapelusz|hut
head|glowa glowy|kopf
headlights|reflektor swiatl|scheinwerfer
headphones|sluchawk|kopfhorer
headset|sluchawk|headset
heart|serc|herz
heartbeat|puls tetn bicie|herzschlag puls
heel|szpilk obcas|absatz
helmet|kask|helm
hemisphere|polkul|halbkugel
hexagon|szesciokat|sechseck
high|wysok|hoch
highlighter|zakreslacz|textmarker
hike|wedrow|wandern
hockey|hokej|hockey
hoodie|bluz|kapuzen hoodie
horizon|horyzont|horizont
horizontal|poziom|horizontal waagerecht
horse|konia konie koniem konik|pferd
hospital|szpital|krankenhaus
hot|gorac|heiss
hourglass|klepsydr|sanduhr
house|domu domy domek|haus
household|domow|haushalt
human|czlowiek|mensch
hurricane|huragan|hurrikan
ice|lody lodow lodu|eis
identification|tozsamosc dowod|ausweis
image|obraz zdjec|bilder bildes foto
incoming|przychodz|eingehend
indent|wciec|einzug
infinity|nieskonczon|unendlich
info|informac|info
inr|rupia rupii|rupie
inset|wklesl|eingelassen
intersect|przeciec|schnitt
intersection|przeciec|schnittmenge
intersex|interpl|intersex
inverse|odwrot|invertier
invoice|faktur|rechnung
island|wysp|insel
italic|kursyw|kursiv
jar|sloik|glas
jeep|terenow|gelandewagen jeep
joystick|joystick drazek|joystick
jpy|jena jen|yen
justify|wyjustuj|blocksatz
kanban|kanban|kanban
key|klucz|schlussel
keyboard|klawiatur|tastatur
keyhole|dziurk|schlusselloch
keys|klawisz|taste
kit|apteczk zestaw|set
knife|noza noze nozem|messer
krw|won|won
kzt|tenge|tenge
label|etykiet|etikett
ladder|drabin|leiter
laminated|laminowan|laminiert
lamp|lamp|lampe
landing|ladowan|landung
laptop|laptop|laptop notebook
lasso|lasso|lasso
launch|start wystrzel|start
layout|uklad|layout
leaf|lisc|blatt
lectern|mownic|rednerpult
left|lewo lewa lewy|links
lego|klocki lego|lego
less|mniej|weniger
letter|litera list|buchstabe
lifebuoy|ratunkow kolowe|rettungsring
lightbulb|zarowk pomysl|gluhbirne idee
lighthouse|latarni morsk|leuchtturm
lightning|blyskawic piorun|blitz
lines|linie|linien
link|lacz link odnosnik|verknupf
list|lista listy|liste
lock|klodk zamek zamku|schloss
lockers|szafki|schliessfach
log|klod drewn|holz stamm
logo|logotyp marka marki|logotyp marke
loop|petl|schleife
lotus|lotos|lotus
low|nisk|niedrig
machine|maszyn pralk|maschine
magic|magi|magie zauber
magnet|magnes|magnet
magnifying|lupa lupy lupe|lupe
mailbox|skrzynk pocztow|briefkasten
male|mezczyz|mannlich
map|mapa mapy mape mapk|karte
mark|znak|zeichen
marker|marker|marker
martini|martini drink|martini
mask|maska maski|maske
math|matemat|mathe
medal|medal|medaille
medium|sredni|mittel
megaphone|megafon ogloszen|megafon
meh|oboj|egal
melting|topni|schmelz
member|czlonk element|element
memory|pamiec|speicher
merge|scal polacz|zusammenfuhr merge
metal|metal|metall
meteor|meteor|meteor
metronome|metronom|metronom
microphone|mikrofon|mikrofon
microscope|mikroskop|mikroskop
middle|srodk|mitte
military|wojskow|militar
minus|minus odejm|minus
mobile|telefon komork|handy smartphone
money|pieniadz banknot|geld
monitor|monitor ekran|monitor bildschirm
moon|ksiezyc|mond
moped|motorower skuter|moped
mosque|meczet|moschee
motion|ruch|bewegung
motorcycle|motocykl|motorrad
mountains|gory gorsk gorami|berg
mouse|mysz|maus
move|ruch przesun|bewegen
music|muzyk|musik
navigation|nawigac|navigation
needle|igla igly igle|nadel
nervous|zdenerw|nervos
network|siec sieci|netzwerk
neuter|nijak|neutrum
newspaper|gazet|zeitung
ngn|naira|naira
nib|stalowk|feder
nonbinary|niebinarn|nichtbinar
none|brak|keine
notch|wciecie|kerbe
note|notat|notiz
notebook|notes zeszyt|notizbuch heft
notepad|notatnik|notizblock
notification|powiadom|benachricht
nuclear|atomow jadrow|atomkraft
number|liczb numer cyfr|nummer zahlen
numpad|numeryczn|ziffernblock
nut|nakretk orzech|mutter nuss
octagon|osmiokat|achteck
office|biur|buro
offset|przesun|versatz
once|jednokrot|einmal
onigiri|onigiri ryz|onigiri
open|otwor otwar otwier|offnen offen
operations|dzialani|operationen
option|opcj|option
orange|pomarancz|orange
outdent|wysun|ausruck
outgoing|wychodz|ausgehend
outline|kontur|umriss
oven|piekarnik piec|ofen
package|paczk przesylk|paket
paint|farb malow|farbe malen
palette|palet|palette
palm|palma palmy dlon|palme
panel|panel|panel
panorama|panoram|panorama
pants|spodnie|hose
paper|papier|papier
paperclip|spinacz zalacz|buroklammer anhang
parachute|spadochron|fallschirm
paragraph|akapit paragraf|absatz
parallelogram|rownoleglobok|parallelogramm
park|park|park
password|hasl|passwort
path|sciezk|pfad
pause|pauz wstrzym|pause
paw|lapa lapy|pfote
payment|platnos|zahlung
peace|pokoj|frieden
pen|dlugopis pioro piora piorem|stift kugelschreiber
pencil|olow|bleistift
pendant|wisiorek|pendel
pennant|proporczyk|wimpel
pentagon|pieciokat|funfeck
pentagram|pentagram|pentagramm
pepper|papryk pieprz|paprika pfeffer
percent|procent|prozent
person|osob czlowiek|person
perspective|perspektyw|perspektive
phone|telefon|telefon
pi|pi|pi
piano|fortepian pianin|klavier
picnic|piknik|picknick
picture|obraz|bilder bildes foto
pie|kolowy|kuchendiagramm
piece|kawal|stuck
piggy|skarbon swink|sparschwein
pill|tablet pigulk leki|pille tablette
pin|pinezk szpilk|stecknadel pin
ping|ping|ping
pint|kufel|pint
pinwheel|wiatraczek|windrad
pipe|rura rury|rohr
pizza|pizz|pizza
placeholder|zastep|platzhalter
plane|samolot|flugzeug
planet|planet|planet
plant|rosli|pflanze
play|odtwarz|abspielen
playlist|playlist|playlist wiedergabeliste
plug|wtyczk|stecker
plus|plus dodaj|plus
pointing|wskazuj|zeigen
poker|poker|poker
polar|biegunow|polar
police|polic|polizei
polygon|wielokat|polygon
pool|basen|pool schwimmbad
popcorn|popcorn|popcorn
popsicle|lody|eis
pot|garnek doniczk|topf
potted|doniczk|topf
power|zasilan wylacz wlacz|strom
praying|modl|beten
prescription|recept|rezept
presentation|prezentac|prasentation
print|druk|druck
printer|drukark|drucker
profile|profil|profil
prohibit|zakaz|verbot
projector|projektor rzutnik|beamer projektor
pull|pociagn|ziehen
pulse|puls|puls
pump|dystrybutor pompa|zapfsaule pumpe
puzzle|puzzle|puzzle
qr|qr|qr
question|pytan|frage
queue|kolejk|warteschlange
quotes|cytat|zitat
rabbit|krolik|hase kaninchen
racquet|rakiet|schlager
radical|pierwiast|wurzel
radio|radio|radio
radioactive|radioaktyw promieniotw|radioaktiv
rain|deszcz|regen
rainbow|tecza tecze teczy|regenbogen
ranking|ranking|rangliste
reality|rzeczywist|realitat
receipt|paragon rachun|beleg quittung
record|nagryw|aufnahme
rectangle|prostokat|rechteck
recycle|recykl|recycling
reel|rolka szpul|rolle
regional|regional|regional
register|kasa kase kasie|kassen
registered|zastrzez|registriert
repeat|powtorz|wiederhol
request|prosb|anfrage
resize|rozmiar|grosse
return|powrot enter|eingabe
rewind|przewin|zuruckspul
right|prawo prawa prawy|rechts
ringing|dzwoni|klingel
road|droga drogi|strasse
robot|robot|roboter
rocket|rakiet|rakete
roller|walek walk|rolle
rolling|kolk|roll
roof|dach|dach
rose|roza rozy|rose
rotate|obrot obroc|drehen
round|okrag|rund
rows|wiersz|zeile
rub|rubel rubl|rubel
rug|dywan|teppich
ruler|linijk|lineal
run|bieg|laufen
sad|smut|traurig
sailboat|zaglowk|segelboot
sample|probk|probe
saucer|spodek ufo|untertasse
sawtooth|pilokszt|sagezahn
scales|waga wagi wage|waage
scan|skan|scan
scatter|punktow|streu
scissors|nozyczk|schere
scooter|hulajnog skuter|roller
screen|ekran|bildschirm
screencast|ekran|screencast
screwdriver|srubokret|schraubenzieher
scribble|bazgrol|kritzel
script|scenariusz skrypt|skript drehbuch
scroll|zwoj przewij|rolle scrollen
seal|pieczec|siegel
seat|fotel siedzen|sitz
seatbelt|pasy pasow|sicherheitsgurt
security|bezpiecz ochron|sicherheit
segment|odcinek|segment
selection|zaznacz wybor|auswahl
shapes|ksztalt|formen
share|udostepn|teilen
sharp|ostry|scharf
shelter|schron|schutz
shield|tarcz|schild
shipping|wysyl transport|versand
shirt|koszul|hemd
shooting|spadajac|sternschnuppe
shopping|zakup|einkauf
shovel|lopat|schaufel
shower|prysznic|dusche
shrimp|krewet|garnele
shuffle|losow|zufall mischen
sidebar|panel boczn|seitenleiste
sigma|sigma suma|sigma summe
sign|znak podpis|schild
signal|sygnal zasieg|signal
signature|podpis|unterschrift
signpost|drogowskaz|wegweiser
sim|sim|sim
sine|sinus|sinus
siren|syren|sirene
ski|narty nart|ski
skip|pomin|uberspringen
skull|czaszk|schadel
slash|ukosnik wylacz|schrag
slate|klaps|klappe
slice|plaster kawalek|scheibe
sliders|suwak|regler
slideshow|pokaz slajd|diashow
smiley|usmiech buzk emotk|smiley lacheln
sneaker|sportow trampk|turnschuh sneaker
snow|snieg sniez|schnee
snowboard|snowboard|snowboard
snowflake|platek|schneeflocke
soap|mydl|seife
soccer|pilk nozn|fussball
sock|skarpet|socke
solar|slonecz|solar
sort|sortuj|sortier
sound|dzwiek|klang
spade|pika piki lopat|pik
sparkle|iskr blysk|funkeln
speaker|glosnik|lautsprecher
speedometer|predkosciom|tacho
sphere|kula kuli|kugel
spinner|ladow|lade
spiral|spiral|spirale
split|podziel|teilen
spray|spray|spray
spread|rozloz|ausbreit
square|kwadrat|quadrat
stack|stos warstw|stapel
stage|scen|buhne
stairs|schody|treppe
stamp|pieczat|stempel
stand|statyw|stander
standard|standard|standard
star|gwiazd|stern
station|stacj|station
steam|pary parowa|dampf
steering|kierownic|lenkrad
stein|kufel|krug
steps|kroki stopni|stufen
stethoscope|stetoskop|stethoskop
sticker|naklejk|aufkleber
stool|taboret|hocker
stop|stop zatrzym|stopp
storefront|sklep|laden
straight|prost|gerade
strategy|strategi|strategie
strikethrough|przekresl|durchgestrichen
strip|tasm|streifen
structure|struktur|struktur
student|student uczen ucznia|student
subscript|indeks dolny|tiefgestellt
subset|podzbior|teilmenge
subtitles|napis|untertitel
subtract|odejm|subtrah
subway|metro|ubahn
suitcase|walizk|koffer
sun|slonc|sonne
sunglasses|okulary slonecz|sonnenbrille
superscript|indeks gorny|hochgestellt
superset|nadzbior|obermenge
swap|zamien|tauschen
swatches|probnik|farbfeld
swim|plywa|schwimm
swimming|basen|schwimmbad
swipe|przesun|wischen
switch|przelacz|schalter
sword|miecz|schwert
synagogue|synagog|synagoge
syringe|strzykawk|spritze
table|tabel|tabelle
tablet|tablet|tablet
tabs|zakladk|tabs
tag|etykiet metk|etikett
takeoff|start|start
tap|stukn|tippen
tape|tasm|kassette
target|celu cele tarcz|ziel
taxi|taksowk|taxi
taxiing|kolow|rollen
tea|herbat|tee
teacher|nauczyciel|lehrer
teardrop|kropl|tropfen
television|telewiz|fernseher
tennis|tenis|tennis
tent|namiot|zelt
terminal|terminal|terminal
test|test probowk|test
text|tekst|text
textbox|pole tekst|textfeld
thermometer|termometr|thermometer
throw|rzut|werfen
thumbs|kciuk|daumen
ticket|bilet|ticket
tilde|tylda|tilde
tilt|pochyl|gekippt
timer|stoper minutnik|timer
times|razy czas|zeit
tip|napiwek napiwk|trinkgeld
tipi|tipi|tipi
tire|opon|reifen
toggle|przelacz|schalter
toilet|toalet|toilette
tool|narzedz|werkzeug
toolbox|narzedz|werkzeugkasten
tooth|zabek zebow zeby dentyst|zahne zahnen
top|gory gorny gorna gorami|oben
tornado|tornado traba|tornado
tote|torb|tasche
towel|recznik|handtuch
tower|wieza wiezy|turm
tractor|traktor ciagnik|traktor
trademark|znak towarow|marke
traffic|uliczn swiatla|verkehr ampel
trailer|przyczep|anhanger
train|pociag|zug
tram|tramwaj|strassenbahn
transfer|przelew transfer|uberweis
transgender|transplci|transgender
translate|tlumacz|ubersetz
transparent|przezrocz|transparent
trash|kosza koszem smiec usun|mull papierkorb
tray|taca tacy skrzynk|ablage
treasure|skarb|schatz
tree|drzew|baum
trend|trend|trend
triangle|trojkat|dreieck
trifold|skladan|falt
trolley|wozek|wagen
trophy|puchar trofeum|pokal trophae
truck|ciezarowk|lastwagen lkw
tube|probowk|rohr
tulip|tulipan|tulpe
turret|wieza|turm
umbrella|parasol|regenschirm
underline|podkresl|unterstrich
union|sumy zbior|vereinigung
unite|polacz|vereinig
up|gory gorny gorami|oben hoch
upload|wysl przesl|hochlad
user|uzytkown|benutzer nutzer
van|furgon dostawcz|lieferwagen
vault|sejf skarbiec|tresor
vector|wektor|vektor
vertical|pion|senkrecht vertikal
vibrate|wibrac|vibrier
video|wideo film|video
view|widok|ansicht
vignette|winiet|vignette
vinyl|winyl plyt|vinyl schallplatte
virtual|wirtual|virtuell
virus|wirus|virus
visor|przylbic daszek|visier
voicemail|poczta glosow|anrufbeantworter
volleyball|siatkow|volleyball
walk|spacer chod|gehen
wall|sciana sciany mur|wande wanden mauer
wallet|portfel|geldborse brieftasche
wand|rozdzk|zauberstab
warehouse|magazyn|lager
warning|ostrzez uwag|warnung
washing|pralk pran|wasch
watch|zegarek zegark|armbanduhr
wave|fala fale fali|welle
waveform|fala dzwiek|wellenform
waving|machan|winken
wavy|falist|wellig
webcam|kamerk|webcam
west|zachod|west
wheel|kola kole kolem kolowe kierownic|rader rades
wheelchair|wozek inwalidz niepelnospr|rollstuhl
wifi|wifi siec|wlan
wind|wiatr|wind
windmill|wiatrak|windmuhle
window|okno okna okien|fenster
wine|wino wina winem|wein
wink|mrug|zwinker
withdraw|wyplat|auszahl
wrench|klucz|schraubenschlussel
yarn|wloczk|wolle garn
yin|yin|yin
a11y|dostepnosc|barrierefrei
accessibility|dostepnosc|barrierefrei
account|konto konta|konto
add|dodaj doda|hinzu
addition|dodaw|addition
agriculture|rolnic|landwirtschaft
ahead|naprzod|voraus
airport|lotnisk|flughafen
alert|alert|warnung
alignment|wyrown|ausricht
analysis|analiz|analyse
analyze|analiz|analyse
animal|zwierz|tier
apple|jablk|apfel
application|aplikac|anwendung
arithmetic|arytmet|arithmetik
arrangement|uklad|anordnung
arrival|przylot|ankunft
arrowhead|grot|pfeilspitze
arts|sztuk|kunst
astronomy|astronom|astronomie
authenticated|logow|anmeld
authentication|logow uwierzytel|anmeld
automobile|samochod auto|auto
award|nagrod|auszeichnung
backup|zapasow|backup sicherung
baggage|bagaz|gepack
bath|kapiel lazien|bad
bathroom|lazien|badezimmer
beverage|napoj|getrank
biometrics|biometr|biometrie
birthday|urodzin|geburtstag
blackboard|tablic|tafel
blur|rozmyc|unscharf
body|cialo ciala|korper
braces|klamr|klammer
brick|cegl|ziegel
brightness|jasnosc|helligkeit
bubble|dymek dymk|blase
burning|plonac plonie|brennen
business|firm biznes|geschaft firma
buying|kupi kupn|kaufen
camping|kemping biwak|camping
cancelled|anul|abgebrochen
carpentry|stolarz|tischler
casino|kasyn|kasino
caution|uwag ostroz|vorsicht
celcius|celsjusz|celsius
cellphone|komork|handy
cellular|komorkow|mobilfunk
cent|cent|cent
chain|lancuch|kette
chained|lancuch|verkettet
change|zmian|andern
character|znak|zeichen
charged|ladow|laden
charger|ladowark|ladegerat
checkbox|wyboru|kontrollkastchen
checklist|kontrolna|checkliste
checkout|kasa kase kasie|kassen
chess|szachy szachow|schach
classroom|klasa klasy sala|klassenzimmer
cleaning|sprzat|putzen
clear|czysz|klar
climbing|wspin|klettern
closet|szaf|schrank
clothes|ubran|kleidung
clothing|ubran|kleidung
cloudy|pochmurn|bewolkt
cog|tryb|zahnrad
collapse|zwin|einklappen
college|uczeln|hochschule
color|kolor|farbe
combine|polacz|kombin
comment|komentarz|kommentar
commerce|handel sklep|handel
communications|komunikac|kommunikation
commuter|dojazd|pendler
company|firm|firma
comparison|porown|vergleich
completed|ukoncz|fertig
connection|polacz|verbindung
connectivity|lacznosc|konnektiv
construction|budow|bauen baustelle
contact|kontakt|kontakt
contrast|kontrast|kontrast
country|kraju kraje krajow|lander landes
countries|kraju kraje krajow|lander landes
create|utworz|erstellen
crossed|przekresl|durch
danger|niebezpiecz|gefahr
dangerous|niebezpiecz|gefahr
date|data daty|datum
day|dnia dniu dzienny|tag
daylight|dnia dniu dzienny|tag
daytime|dnia dniu dzienny|tag
dead|martw|tot
debug|debug|debug
defense|obron|abwehr
degree|stopni|grad
delete|usun kasuj|loschen
design|projekt|design
dessert|deser|nachtisch
development|programow|entwicklung
die|kostk|wurfel
difference|roznic|unterschied
digit|cyfr|ziffer
dining|jadal|essen
directional|kierunk|richtung
direction|kierunk|richtung
directory|katalog|verzeichnis
directories|katalog|verzeichnis
disabled|niepelnospr|behindert
disconnected|rozlacz|getrennt
discount|znizk rabat|rabatt
dismissed|odrzuc|abgelehnt
display|wyswietlacz|display
dividend|dzieln|dividend
division|dzielen|division
divisor|dzielnik|divisor
doctor|lekarz|arzt
document|dokument|dokument
donation|darowizn|spende
done|gotowe gotowy zrobion|erledigt
dotted|kropkow|gepunktet
drag|przeciag|ziehen
drawing|rysow|zeichnen
drink|napoj|getrank
droplet|kropl|tropfen
drug|leki lekow|medikament
duplicated|duplik|duplizier
earth|ziemi|erde
eating|jedzen|essen
ecommerce|sklep|shop
editing|edyc edyt|bearbeit
editor|edytor|editor
education|edukac|bildung
electricity|prad elektryczn|strom
element|element|element
ellipses|wielokropek|auslassung
ellipsis|wielokropek|auslassung
email|email poczt|email
emergency|nagly alarm|notfall
emoji|emoji|emoji
emphasis|wyroz|betonung
encrypted|szyfr|verschlussel
encryption|szyfr|verschlussel
energy|energi|energie
enter|wejs|eingabe
environmental|ekolog|umwelt
equality|rownosc|gleichheit
error|blad bled|fehler
ethernet|ethernet|ethernet
evening|wieczor|abend
event|wydarzen|ereignis
evil|zly zla|bose
excel|excel|excel
exercise|cwicz|training
exit|wyjs|ausgang
expand|rozwin|aufklappen
expense|wydatk koszt|ausgabe
experiment|eksperyment|experiment
farming|rolnic|landwirtschaft
favorite|ulubion|favorit
field|pole boisk|feld
filter|filtr|filter
finances|finans|finanzen
find|znajd szuk|finden
finished|ukoncz|fertig
flash|blysk|blitz
flush|splucz|spulen
font|czcionk|schrift
formatting|formatow|format
fruit|owoc|obst frucht
fuel|paliw|kraftstoff
fullscreen|pelny ekran|vollbild
furniture|mebl|mobel
gallery|galeri|galerie
gamble|hazard|glucksspiel
gaming|gry gier|gaming
geography|geograf|geographie
geolocation|lokaliz|standort
geometry|geometri|geometrie
gesture|gest|geste
give|daj|geben
global|globaln|global
gluten|gluten|gluten
green|zielon|grun
groceries|zakup spozyw|lebensmittel
group|grup|gruppe
grow|wzrost|wachsen
guarded|strzez|geschutzt
gym|silown|fitness
handle|uchwyt|griff
hashtag|hashtag|hashtag
hate|nienawis|hass
hdd|dysk|festplatte
heading|naglow|uberschrift
health|zdrow|gesundheit
healthy|zdrow|gesund
help|pomoc|hilfe
hidden|ukry|versteckt
hide|ukry|verstecken
home|domu domy domek|haus
humidity|wilgotn|feuchtigkeit
hyperlink|odnosnik|verknupf
i18n|tlumacz|ubersetzung
industry|przemysl|industrie
information|informac|information
injury|uraz|verletzung
ink|atrament|tinte
input|pole wejs|eingabe
insect|owad|insekt
insert|wstaw|einfugen
inspect|sprawdz|prufen
insurance|ubezpiecz|versicherung
integration|integrac|integration
interface|interfejs|oberflache
internationalization|tlumacz|ubersetzung
internet|internet|internet
invert|odwroc|umkehren
join|dolacz|verbinden
journal|dziennik|journal
king|krola krolem krolewsk|konig
kitchen|kuchni|kuche
landline|stacjonarn|festnetz
landscape|krajobraz|landschaft
language|jezyk|sprache
law|prawo prawa sadu|gesetz rechtlich
layer|warstw|ebene
leader|lider|leiter
lens|obiektyw soczew|objektiv
library|bibliotek|bibliothek
light|swiatl jasn|licht hell
like|lubi polub|gefallt
loader|ladow|lade
loading|ladow wczyt|laden
locate|znajd|finden
location|lokaliz miejsc|ort standort
locked|zablokow zamkn|gesperrt
login|logow zaloguj|anmeld login
love|milos kocha|liebe
machinery|maszyn|maschine
mail|poczt|post mail
man|mezczyz|mann
maps|mapa mapy mape|karte
market|sklep rynek|markt
match|dopasuj|passend
mathematics|matemat|mathematik
meal|posilek danie|mahlzeit
mechanical|mechani|mechanisch
media|media|medien
medical|medycz|medizin
medicine|leki medycz|medizin
meeting|spotkan|besprechung
memorandum|notat|notiz
menu|menu|menu
message|wiadomos|nachricht
messaging|wiadomos|nachricht
meteorology|pogod|wetter
meter|miernik|zahler
microchip|chip|chip
minimize|minimal|minimieren
missing|brak|fehlend
mode|tryb|modus
monarch|monarch|monarch
more|wiecej|mehr
movie|film|film
multiply|mnoz|multiplizier
muted|wycisz|stumm
nature|natur przyrod|natur
nautical|morski|nautisch
news|wiadomos aktualnos|nachrichten
night|nocy noca nocny|nacht
novel|powiesc|roman
numeral|cyfr|ziffer
objects|przedmiot|objekte
ocean|ocean|ozean
ordered|numerowan|nummeriert
outdoors|plener|draussen
outlet|gniazd|steckdose
overcast|zachmurz|bedeckt
overflow|przepeln|uberlauf
padlock|klodk|vorhangeschloss
party|impre przyjec|party
paying|plac|bezahlen
pedestrian|pieszy piesi|fussganger
people|ludzi osob|leute
performance|wydajn|leistung
periodical|czasopism|zeitschrift
pet|zwierz|haustier
pharmaceutical|aptek|apotheke
pharmacist|aptek|apotheke
pharmacy|aptek|apotheke
photograph|zdjec fotograf|foto
photography|zdjec fotograf|foto
physics|fizyk|physik
picker|wybor|auswahl
place|miejsc|orte
pointer|wskaznik|zeiger
portfolio|portfolio|portfolio
post|poczt wpis|post
preferences|ustawien|einstellung
price|cena ceny cenn|preis
privacy|prywatn|privatsphare
private|prywatn|privat
product|produkt|produkt
progress|postep|fortschritt
property|nieruchom|immobilie
public|publiczn|offentlich
purchase|zakup|kauf
pushpin|pinez|reisszwecke
queen|krolow|konigin
query|zapyt|abfrage
rail|kolej|bahn
rainy|deszczow|regnerisch
randomize|losow|zufall
rate|ocen|bewert
rating|ocen|bewertung
read|czyta|lesen
reader|czytnik|leser
reading|czyta|lesen
reception|recepcj|empfang
recording|nagryw|aufnahme
redo|ponow|wiederhol
refine|filtr|verfeiner
refreshing|odswiez|aktualisier
religion|religi|religion
reminder|przypomn|erinnerung
remove|usun|entfernen
renewable|odnawial|erneuerbar
resolution|rozdzielcz|auflosung
restaurant|restaurac|restaurant
resume|wznow|fortsetzen
reverse|wstecz|ruckwarts
ribbon|wstazk|band
ringer|dzwonek|klingel
royalty|krolews|konigt
safety|bezpiecz|sicherheit
sale|sprzeda wyprzed|verkauf
save|zapis|speichern
saving|oszczedn|sparen
scanner|skaner|scanner
schedule|harmonogr|zeitplan
school|szkol|schule
science|nauk|wissenschaft
seafood|owoce morza|meeresfrucht
search|szuk wyszuk|suche
secure|bezpiecz|sicher
select|wybier wybor|wahlen
sell|sprzeda|verkauf
send|wysl wysyl|senden
sent|wysl wysyl|gesendet
server|serwer|server
serverless|serwer|server
service|uslug|dienst service
set|zestaw|set
setting|ustawien|einstellung
setup|konfigur|einricht
ship|statek statk|schiff
shoe|buty buta butow|schuh
shortcut|skrot|kurzbefehl
show|pokaz|anzeigen
silenced|wycisz|stumm
silent|cich|leise
smiling|usmiech|lachel
sms|sms|sms
snippet|fragment|snippet
snooze|drzemk|schlummer
socket|gniazd|steckdose
song|piosenk|lied
source|zrodl|quelle
space|kosmos|weltraum
spectrum|widmo|spektrum
speech|mowa mowy|sprache
spin|obrot|drehen
sports|sport|sport
start|start|start
statistics|statyst|statistik
stock|gield akcje|aktien
storage|pamiec magazyn|speicher
stormy|burz|sturm
story|histori|geschichte
subtraction|odejm|subtraktion
sum|suma sumy|summe
sunny|slonecz|sonnig
sunshine|slonc|sonnenschein
support|wsparc pomoc|support hilfe
symbol|symbol|symbol
sync|synchroniz|synchron
synchronize|synchroniz|synchron
synth|syntezator|synthesizer
synthesizer|syntezator|synthesizer
system|system|system
talk|rozmow|sprechen
task|zadan|aufgabe
team|zespol|team
technology|technolog|technologie
telephone|telefon|telefon
temperature|temperatur|temperatur
theater|teatr|theater
to-do|zadan|aufgabe
todo|zadan|aufgabe
toy|zabawk|spielzeug
transcribed|transkryp|transkript
transcription|transkryp|transkript
transit|transport publiczn|nahverkehr
transportation|transport|transport
travel|podroz|reise
traveling|podroz|reise
typeface|czcionk|schrift
typography|typograf|typografie
undo|cofn|ruckgangig
university|uczeln uniwersyt|universitat
unlocked|odblok otwart|entsperrt
usd|dolar|dollar
valise|walizk|koffer
vegan|wegan|vegan
vegetable|warzyw|gemuse
vehicle|pojazd|fahrzeug
verification|weryfik|verifiz
verified|weryfik|verifiz
version|wersj|version
versioning|wersj|version
victory|zwyciest|sieg
visibility|widoczn|sichtbar
visible|widoczn|sichtbar
vision|wzrok|sehen
voice|glos|stimme
volume|glosnosc|lautstarke
waiting|czek oczek|warten
walking|spacer chod|gehen
wallpaper|tapet|tapete
warm|cieply ciepla|warm
water|woda wody wode|wasser
weather|pogod|wetter
web|strona strony www|web
webpage|strona strony www|webseite
website|strona strony www|webseite
wellness|zdrow|wellness
whiteboard|tablic|whiteboard
winning|wygr|gewinn
winter|zima zimy|winter
wireframe|szkielet makiet|wireframe
wireless|bezprzewod|kabellos
woman|kobiet|frau
world|swiata swiecie|welt
write|pisz pisa pismo|schreiben
writing|pisz pisa pismo|schreiben
zoom|powieksz przybliz|zoom
`;
