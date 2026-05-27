# Vermittlung von IT-Konzepten an Hochschulen am Beispiel der TCP/IP-Kom- munikation: Konzeption und Umsetzung einer VR-Anwendung

Integrationsseminar vorgelegt am 06.02.2026

Fakultät Wirtschaft und Gesundheit Studiengang Wirtschaftsinformatik Kurs WWI2023G

von Jan Rögner, Luca Florus, Mark Keller, Andreas Cherbukhovskiy

DHBW Stuttgart: Nadine Bisswang Prof. Dr. Sebastian Richter

* * *

Inhaltsverzeichnis

Abkürzungsverzeichnis.....III

Abbildungsverzeichnis.....IV

1 Einleitung.....1

2 Theoretischer Rahmen.....2

2.1 Grundlagen von Virtual Reality .....2
2.1.1 Definition von Virtual Reality .....2
2.1.2 Arten von Virtual Reality .....3
2.1.3 Forschungsstand zur Virtual Reality in der Hochschule .....5

2.2 Grundlagen von TCP/IP .....6
2.2.1 Definition .....6
2.2.2 Einbettung in den Gesamtkontext der Vorlesung Kommunikationssysteme .....7

2.3 Didaktische Grundlagen zur Entwicklung von Lehrinhalten .....9
2.3.1 Beispielhafte Konzepte des Instruktionsdesigns .....9
2.3.2 Entwicklung von Lehrinhalten in Virtual Reality .....10
2.3.3 Vorstellung der Virtual Reality Integration-Methode .....11

3 Methodische Vorgehens

* * *

Abkürzungsverzeichnis

| HMD | = | Head-Mounted Displays |
| --- | --- | --- |
| IP | = | Internet Protocol |
| IVR | = | Immersive Virtual Reality |
| TCP | = | Transmission Control Protocol |
| VR | = | Virtual Reality |
| VRIN | = | Virtual Reality Integration |

* * *

IV

**Abbildungsverzeichnis**
Abb. 1: Konzeptumgebung Steuer-Szenario ... 19
Abb. 2: Konzeptumgebung Lern-Szenario 1 ... 20
Abb. 3: Konzeptumgebung Lern-Szenario 2 ... 21
Abb. 4: Konzeptumgebung Bewertungs-Szenario ... 21

* * *

**Einleitung1**

Die Arbeit untersucht die Vermittlung von Transmission Control Protocol/ Internet Protocols (TCP/IP)-Kommunikation in der Hochschullehre durch den gezielten Einsatz einer Virtual Re- ality (VR)-Anwendung und entwickelt dafür ein systematisch begründetes Konzept. Im Modul Kommunikationssysteme wird das TCP/IP-Modell bislang überwiegend abstrakt und textba- siert vermittelt, obwohl viele Studierende insbesondere bei der Vorstellung paketvermittelter Prozesse, Adressierung und Routing Schwierigkeiten haben, die Abläufe als zusammenhän- genden Gesamtprozess zu erfassen. Gleichzeitig zeigen aktuelle Forschungsarbeiten zu Im- mersive VR im Hochschulkontext ein hohes Potenzial für motivierende, erfahrungsbasierte Lernumgebungen, verweisen jedoch auf fehlende Gestaltungsstandards und methodische In- konsistenzen. Vor diesem Hintergrund verfolgt die vorliegende Arbeit das Ziel, auf Basis di- daktischer Modelle wie ADDIE und SAM, VR-spezifischer Ansätze wie VRID und FAIRI sowie der Virtual Reality Integration (VRIN)-Methode ein VR-Lehrkonzept zu entwickeln, das die Ver- mittlung der Internet- und Transportschicht des TCP/IP-Modells unterstützt und gleichzeitig inhaltliche, didaktische und technische Anforderungen integriert. Dazu werden zunächst theo- retische Grundlagen zu VR, TCP/IP und Instruktionsdesign aufgearbeitet, anschließend auf Grundlage leitfadengestützter Interviews mit einem Lehrenden und einem Didaktiker Anforde- rungen erhoben und priorisiert und darauf aufbauend VR-Szenarien konzipiert, die die abs- trakten Netzwerkprozesse in einer logistikbasierten Metapher erfahrbar machen.

Sprachlich geglättet durch ChatGPT 5.2

* * *

## Theoretischer Rahmen

Dieses Kapitel etabliert den theoretischen Bezugsrahmen der Arbeit und schafft die konzepti- onelle Grundlage für die nachfolgende Konzeption des VR-Lehrinhalts. Dazu werden zunächst die zentralen technologischen und didaktischen Grundlagen aufgearbeitet, die für die Vermitt- lung von TCP/IP-Kommunikation in VR relevant sind. Ziel ist es, die unterschiedlichen Per- spektiven aus VR, Netzwerktechnik und Instruktionsdesign systematisch zusammenzuführen und in einen konsistenten Gesamtkontext einzuordnen.

## 2.1 Grundlagen von Virtual Reality

In diesem Kapitel wird der Bezugsrahmen für die weitere Arbeit aufgebaut. Zuerst wird VR konzeptionell definiert und über zentrale Merkmale beschrieben. Danach folgt eine Einordnung der gängigen VR-Ausprägungen nach ihrem Immersionsgrad. Abschließend wird der For- schungsstand zur VR in der Hochschullehre dargestellt.

## 2.1.1 Definition von Virtual Reality

Eine allgemeingültige Definition für VR hat sich bislang nicht durchgesetzt. Dies liegt daran, dass es sich um ein vergleichsweise neues Medium handelt. Zudem betrachten verschiedene Forschungszweige die Technologie aus unterschiedlichen Blickwinkeln. Dennoch hat sich die Wissenschaft auf ein gemeinsames Verständnis geeinigt. Die Definition stellt das Erlebnis des Nutzers in den Mittelpunkt und beschränkt sich nicht allein auf die technische Hardware.

Stattdessen stützt sich die Definition auf das Konzept der „Telepräsenz“. Damit ist die Wahr- nehmung einer Umgebung gemeint, die durch ein Medium vermittelt wird. Der Begriff „Prä- senz“ beschreibt dabei das konkrete Gefühl, sich tatsächlich in dieser Umgebung zu befinden. Daraus leitet sich eine spezifische Definition ab: VR ist eine reale oder simulierte Umgebung, in der der Nutzer Telepräsenz erlebt. Dieser Ansatz ermöglicht es, die Technologie als ein graduelles Konzept zu verstehen. Sie variiert dabei entlang zweier wesentlicher technologi- scher Dimensionen. 2

Die erste Dimension wird als Lebendigkeit bezeichnet. Sie beschreibt die sensorische Vielfalt und die Auflösung der medialen Umgebung. Die zweite Dimension ist die Interaktivität. Sie definiert das Ausmaß, in dem der Nutzer die Form und den Inhalt der Umgebung in Echtzeit beeinflussen kann. 3

Vgl. Steuer o. J. , S. 3–6 Vgl. Ebd., S. 10–14

* * *

Diese theoretische Einordnung wird durch eine praktische Sichtweise erweitert. Auch hier gilt
VR zwar als neues Medium, wird aber nicht auf die Geräte beschränkt. Der Fokus liegt stattdessen auf der Integration der Technologien. Das Ziel ist es, immersive und interaktive Erfahrungen zu schaffen. In diesen Umgebungen können Nutzer in dreidimensionalen Räumen ak-
4
tiv handeln.

Ein weiterer zentraler Aspekt ist die „Mixed Reality“. Sie bildet eine Untergruppe der VR-Technologien. Kernmerkmal ist die Vermischung von realen und virtuellen Objekten. Dies geschieht
entlang eines sogenannten Kontinuums. Das Spektrum reicht dabei von komplett realen bis
zu vollständig virtuellen Umgebungen. Ein bekanntes Beispiel ist die „Augmented Reality“.
5
Hierbei wird eine echte Umgebung lediglich durch computergenerierte Objekte ergänzt.

Zusammenfassend steht bei VR das durch Technik erzeugte Gefühl der Präsenz im Vordergrund. Dabei ist es zweitrangig, ob die Umgebung vollständig virtuell ist oder auch reale Anteile
besitzt. Die Qualität bestimmt sich vielmehr daraus, wie lebendig die Darstellung ist und wie
umfassend der Nutzer interagieren kann.

2.1.2 Arten von Virtual Reality

Der Begriff VR wird in der Wissenschaft nicht einheitlich verwendet. Er umfasst oft unterschiedliche Technologien. Daher ist eine genaue Unterscheidung der verschiedenen VR-Arten notwendig. Als Maßstab dient hierbei der sogenannte Immersionsgrad. Dieser beschreibt, wie
6
intensiv der Nutzer in die virtuelle Umgebung eintaucht. Immersion entsteht nicht allein durch
Bild und Ton, auch die Qualität der Nutzung ist ein entscheidender Faktor. Nutzer erleben eine
tiefere Immersion, wenn sie natürlich mit der Umgebung agieren. Dies ist wirkungsvoller als
die Bedienung abstrakter 2D-Elemente. Die Art der Interaktion spielt somit eine fundamentale
Rolle, da sie bestimmt, wie stark eine Technologie den Nutzer in die virtuelle Welt einbinden
7
kann.

4
Vgl. Zyda, DeFanti 2003, S. 6
5
Vgl. Kishino o. J. , S. 3f.

5
Vgl. Kishino o. J. , S. 3f.
6
Vgl. Stracke et al. 2025, S. 2

Vgl. Kishino o. J. , S. 3f.
6
Vgl. Stracke et al. 2025, S. 2
7
Vgl. Ebd., S. 3f.

7
Vgl. Ebd., S. 3f.

* * *

plausibel auf Interaktionen reagieren. Nur durch diese Einteilung lassen sich die technischen Unterschiede der Systeme klar und präzise erfassen.

Das Konzept der Immersion ist für die Klassifizierung von VR-Systemen zentral. Es beschreibt, wie stark Nutzer die virtuelle Welt als neue Realität annehmen. Diese Eigenschaft wird maß- geblich durch die Technologie bestimmt. Dabei spielen das Wahrnehmungserlebnis und die Interaktionsmöglichkeiten eine wichtige Rolle. 9 Nicht-immersive VR bezeichnet Anwendungen auf konventionellen Bildschirmen. Der Nutzer bleibt sich hierbei der Trennung zur realen Welt bewusst. Ein sichtbarer Rahmen grenzt die virtuelle Umgebung ab. Die Steuerung erfolgt in- direkt über klassische Eingabegeräte wie Maus oder Tastatur. Aus fachlicher Sicht wird diese Kategorie oft nicht als vollwertige VR eingestuft. In der Praxis wird der Begriff dennoch ver- wendet. Dies führt häufig zu konzeptionellen Unschärfen.

Semi-immersive VR nutzt großflächige Projektionswände. Die virtuelle Umgebung bleibt zwar technisch begrenzt, doch diese Grenzen sind für den Nutzer kaum wahrnehmbar. Eine Anord- nung mehrerer Projektoren hüllt den Betrachter dabei räumlich ein. Ein bekanntes Beispiel hierfür ist die sogenannte Cave Automatic Virtual Environment. Die Steuerung erfolgt oft über freie Gesten oder greifbare Schnittstellen. Solche Systeme kommen vorwiegend im professi- onellen Bereich zum Einsatz. Installation und Betrieb sind jedoch kostenintensiv. Der Aufwand liegt deutlich über den modernen Head-Mounted Displays (HMD).

360-Grad-Videos stellen einen technologischen Sonderfall dar. Oft werden sie über HMD be- trachtet. Sie erzeugen ein Gefühl räumlicher Präsenz. Dies stärkt die emotionale Verbindung zu Lerninhalten, etwa bei virtuellen Exkursionen. Technisch ist die Bewegungsfreiheit jedoch eingeschränkt. Der Nutzer kann den Blickwinkel ändern, sich aber nicht frei durch den Raum bewegen. Dies markiert den Unterschied zur vollständig immersiven VR. Ein wesentlicher Vor- teil liegt in der Wirtschaftlichkeit. Die Produktion ist kostengünstig und teure Hardware ist nicht zwingend nötig. Inhalte lassen sich auch auf Standard-Computern wiedergeben. Bildungsein- richtungen müssen daher kaum in zusätzliche Technik investieren. Experten stufen diese Vi- deos meist nicht als voll immersiv ein, da der Nutzer passiv bleibt. In der akademischen Lehre werden sie dennoch häufig unter dem Begriff VR gefasst. 10

Immersive VR hebt die sichtbaren Grenzen zur physischen Welt auf. Der Nutzer wird vollstän- dig von der virtuellen Umgebung umschlossen. Technisch ermöglichen dies weite Sichtfelder und eine stereoskopische 3D-Darstellung. Seit 2016 ist entsprechende Hardware auch im Konsumentenbereich etabliert. Zu den verbreiteten Systemen zählen Modelle wie die Oculus Rift oder HTC Vive. Der aktuelle Standard wird als Six Degrees of Freedom bezeichnet. Dieser

Vgl. Calvert, Abadia 2020, S. 2f. Vgl. auch im Folgenden Stracke et al. 2025, S. 3 Vgl. Calvert, Abadia 2020, S. 1f.

* * *

erfasst nicht nur Drehungen, sondern auch Positionsänderungen im Raum. Die Visualisierung
passt sich somit in Echtzeit jeder Kopfbewegung an. Dies erzeugt das Gefühl, tatsächlich vor
Ort zu sein. Besonders im Bildungskontext ermöglicht dies tiefgreifende Lernerfahrungen. Die
11
Steuerung erfolgt dabei über Gesten, spezielle Controller oder haptische Handschuhe.

2.1.3 Forschungsstand zur Virtual Reality in der Hochschule

Der hier dargestellte Forschungsstand beruht auf der Auswertung von 38 Artikeln mit insgesamt 44 Einzelstudien. Der Fokus liegt auf der Nutzung von Immersive Virtual Reality (IVR) an
Hochschulen. Die Analyse beleuchtet den aktuellen Entwicklungsstand. Gleichzeitig deckt sie
12
methodische Grenzen des Forschungsfeldes auf.

Oft werden IVR-Anwendungen mit hohen Erwartungen verknüpft. Dazu zählen geringere Kosten, bessere Visualisierungen und engagiertere Studierende. Die untersuchten Studien können diese Hoffnungen jedoch bisher kaum mit Daten belegen. Zudem erschweren technische
Probleme die Nutzung. Ein häufiges Beispiel ist das Auftreten von Motion Sickness, also Übelkeit bei der Anwendung. Auch fehlt es an einheitlichen Standards für die Entwicklung. Bisher
dominieren individuelle Lösungen, wodurch der Vergleich und die Übertragbarkeit verschiedener Designansätze erschwert wird.

Auch die praktische Einführung in den Lehrplan stößt auf Hindernisse. Oft mangelt es an Hardware, technischem Support oder geeigneten Räumen. Häufig fehlen offizielle Prozesse zur
Genehmigung der Lehrinhalte. Auch Strategien zur Einführung von Erstnutzern sind rar. Zwar
gibt es vereinzelte Vorschläge für nutzerfreundliche Richtlinien, eine systematische Umsetzung dieser Standards steht jedoch noch aus.

Die wissenschaftliche Bewertung der IVR-Szenarien erfolgt methodisch uneinheitlich. Theoretisch stützen sich viele Arbeiten auf die Cognitive Load Theory13, die Ergebnisse sind hierbei
jedoch widersprüchlich. Neuere Aspekte dieser Theorie werden in den Studien oft ignoriert.
Dies schränkt die Gültigkeit der Aussagen potenziell ein. Andere Modelle finden kaum Anwendung, wodurch dem Forschungsfeld ein gemeinsamer Rahmen für Design und Evaluation
fehlt.

11
Vgl. Stracke et al. 2025, S. 3
12
Vgl. auch im Folgenden Ebd., S. 13–16

13
Die Cognitive Load Theory erklärt, wie Instruktionsgestaltung die begrenzte Arbeitsgedächtniskapazität berücksichtigt, um Lernen zu optimieren. Vgl. Sweller, Van Merrienboer, Paas 1998, S. 251

* * *

Neuen beruhen. Da Langzeitstudien fehlen, ist unklar, ob diese Motivation bei regelmäßiger Nutzung bestehen bleibt.

Bei den direkten Lernergebnissen sind die Befunde gemischt. Einige Studien finden keine Vor- teile gegenüber herkömmlichen Methoden. Die Mehrheit berichtet jedoch von positiven Effek- ten. Dies gilt besonders für die Medizin und MINT-Fächer. Hier profitieren vor allem das visu- elle Gedächtnis und das räumliche Verständnis. Die vorliegenden Studien zeigen jedoch meist nur statistische Zusammenhänge auf. Ein Nachweis für direkte ursächliche Effekte steht noch aus.

## 2.2 Grundlagen von TCP/IP

Das TCP/IP-Protokollmodell bildet die technische und konzeptionelle Basis moderner Rech- nernetze und stellt das Fundament des heutigen Internets dar. Ursprünglich im Kontext des ARPANET14 entwickelt, verfolgte das Modell von Beginn an das Ziel, eine robuste, flexible und skalierbare Kommunikationsarchitektur zu schaffen, die den Zusammenschluss heterogener Netzwerke ermöglicht. Ein zentrales Designprinzip war dabei die Fähigkeit, auch bei Teilaus- fällen der Netzwerkinfrastruktur eine Ende-zu-Ende-Kommunikation zwischen Hosts aufrecht- zuerhalten. 15

Im Gegensatz zu streng formalisierten Referenzmodellen wurde TCP/IP praxisorientiert ent- worfen und eng an konkrete Einsatzszenarien geknüpft. Der Fokus lag weniger auf einer sau- beren Trennung abstrakter Schichten, sondern vielmehr auf der Zuverlässigkeit und Konver- genz realer Netzwerke. Daraus resultiert ein schlankes Schichtenmodell, das sich in die Ebe- nen Link, Internet, Transport und Application gliedert und bis heute weltweit produktiv einge- setzt wird.

## 2.2.1 Definition

Das TCP/IP-Modell beschreibt eine schichtenbasierte Protokollarchitektur zur paketvermittel- ten Datenübertragung, die speziell für den Einsatz in offenen, heterogenen Netzwerken entwi- ckelt wurde. Es handelt sich dabei nicht um ein normatives Referenzmodell im klassischen Sinne, sondern um eine praxisorientierte Protokollfamilie, deren Struktur aus der realen Imple- mentierung und Nutzung im Internet hervorgegangen ist. Charakteristisch ist die funktionale

ARPANET war ein Rechnernetz und wurde ursprünglich im Auftrag der US Air Force entwickelt. Vgl. Wikipedia 2025 Vgl. auch im Folgenden Tanenbaum, Feamster, Wetherall 2021, S. 61 ff.

* * *

Trennung zwischen Netzvermittlung, Transportdiensten und anwendungsnaher Kommunika-
16
tion. Ein wesentliches architektonisches Merkmal von TCP/IP ist die verbindungslose Arbeitsweise des Internet Protocols. IP übernimmt ausschließlich die logische Adressierung und
Weiterleitung einzelner Datenpakete, ohne Garantien hinsichtlich Reihenfolge, Zustellung
oder Laufzeit zu geben. Jedes Paket wird unabhängig von anderen Paketen behandelt und
kann unterschiedliche Wege durch das Netz nehmen, was insbesondere für große und dyna-
17
mische Netze eine hohe Skalierbarkeit ermöglicht.

Aufbauend auf IP stellt die Transportschicht unterschiedliche Kommunikationsdienste zur Verfügung. TCP realisiert eine verbindungsorientierte Ende-zu-Ende-Kommunikation und gewährleistet unter anderem eine geordnete Datenübertragung, Fehlererkennung sowie Flusskontrolle. Das User Datagram Protocol hingegen arbeitet verbindungslos und verzichtet bewusst auf diese Mechanismen, um geringe Verzögerungen zu ermöglichen. Diese Differenzierung erlaubt es Anwendungen, je nach Anforderungen zwischen Zuverlässigkeit und Perfor-
18
manz zu wählen.

Die bewusste Verlagerung von Zuverlässigkeits- und Korrektheitsmechanismen an die Endsysteme folgt dem Ende-zu-Ende-Prinzip, das als grundlegendes Designprinzip verteilter Systeme gilt. Saltzer, Reed und Clark zeigen, dass Funktionen wie Fehlerkontrolle oder korrekte
Zustellung nur dann vollständig gewährleistet werden können, wenn sie an den Endpunkten
der Kommunikation implementiert sind. Maßnahmen in niedrigeren Schichten können diese
19
Funktionen lediglich unterstützen, jedoch nicht vollständig ersetzen. Zusammenfassend lässt
sich TCP/IP als eine modulare, robuste und anwendungsorientierte Protokollarchitektur definieren, deren Kernidee in der klaren Trennung zwischen einfacher, skalierbarer Netzvermittlung und anwendungsabhängigen Transportdiensten liegt. Die Kombination aus verbindungsloser Paketvermittlung und optionalen Ende-zu-Ende-Garantien bildet die Grundlage für die
20 21
bis heute zentrale Rolle von TCP/IP in modernen Kommunikationssystemen.

2.2.2 Einbettung in den Gesamtkontext der Vorlesung Kommunikationssysteme

Die Vorlesung Kommunikationssysteme verfolgt das Ziel, Studierenden ein ganzheitliches
Verständnis moderner Rechner- und Kommunikationsnetze zu vermitteln. TCP/IP wird dabei
nicht als isolierter Themenkomplex behandelt, sondern fungiert als durchgängiges Referenzund Strukturmodell, das zahlreiche Inhalte der Veranstaltung miteinander verbindet. Bereits

17
Vgl. Ebd., S. 66 f.
18
Vgl. Ebd., S. 78–80

Vgl. Ebd., S. 66 f.
18
Vgl. Ebd., S. 78–80
19
Vgl. Saltzer, Reed, Clark 1984, S. 277 ff.

Vgl. Ebd., S. 78–80
19
Vgl. Saltzer, Reed, Clark 1984, S. 277 ff.
20
Vgl. Trick, Weber 2011, S. 27–28

20
Vgl. Trick, Weber 2011, S. 27–28
21
Vgl. Saltzer, Reed, Clark 1984, S. 286–287

21
Vgl. Saltzer, Reed, Clark 1984, S. 286–287 zu Beginn der Vorlesung werden grundlegende Begriffe wie Netzwerke, Kommunikationsmo- delle und Protokolle eingeführt, um ein einheitliches Begriffsverständnis als Basis für die ver- tiefenden Themen zu schaffen.

Ein zentraler Bestandteil des Moduls ist die Auseinandersetzung mit Schichtenmodellen, ins- besondere mit dem ISO/OSI-Referenzmodell. Dieses dient als theoretisches Ordnungsmodell zur systematischen Klassifikation von Kommunikationsaufgaben. Im Vorlesungsskript wird das TCP/IP-Modell regelmäßig dem OSI-Modell gegenübergestellt, um Gemeinsamkeiten und Un- terschiede herauszuarbeiten. Während das OSI-Modell mit seinen sieben Schichten primär didaktischen Zwecken dient, ist TCP/IP stärker praxisorientiert ausgelegt und fasst Funktionen in weniger, funktional zusammengefassten Ebenen zusammen. Diese vergleichende Betrach- tung unterstützt das Verständnis unterschiedlicher Abstraktionsebenen und erleichtert die Ein- ordnung realer Protokollstacks.

Darüber hinaus verknüpft die Vorlesung TCP/IP konsequent mit konkreten technischen As- pekten wie Übertragungsmedien, Netzwerkkomponenten und Topologien. Netzwerkgeräte wie Router, Switches und Bridges werden nicht isoliert betrachtet, sondern stets im Zusammen- hang mit den Protokollen analysiert, die sie verarbeiten. Insbesondere die Rolle von Routern auf der Internetschicht sowie ihre Funktion bei der paketvermittelten Kommunikation wird an- hand von IP-Adressierung und Routing-Mechanismen detailliert erläutert.

Ein weiterer Schwerpunkt liegt auf der Behandlung von Adressierung und Subnetting, die un- mittelbar auf dem Internet Protocol aufbauen. Studierende lernen, wie IP-Adressen strukturiert sind, wie Netz- und Hostanteile unterschieden werden und weshalb Subnetze für Skalierbar- keit, Sicherheit und Performance moderner Netzwerke unerlässlich sind. Diese Inhalte ver- deutlichen exemplarisch, wie theoretische Konzepte des TCP/IP-Modells in praktischen Netz- werkkonfigurationen Anwendung finden.

Auch sicherheitsrelevante Aspekte werden im Vorlesungsskript explizit im Kontext von TCP/IP behandelt. Dadurch wird deutlich, dass Kommunikationsprotokolle nicht nur funktionale, son- dern auch sicherheitskritische Eigenschaften besitzen. TCP/IP bildet somit die Grundlage für weiterführende Themen wie Netzwerksicherheit, Firewalls oder Virtual Private Networks, die auf den zuvor vermittelten Protokollmechanismen aufbauen.

Im Gesamtkontext der Vorlesung fungiert TCP/IP damit als integratives Modell, das theoreti- sche Grundlagen, technische Details und praxisnahe Anwendungen miteinander verbindet. Die Vorlesung liefert hierfür die inhaltliche Struktur, an der sich die didaktische Aufbereitung orientieren kann. Gerade weil TCP/IP im Rahmen der Vorlesung häufig abstrakt und schema- tisch vermittelt wird, eignet sich das Modell in besonderem Maße für eine Visualisierung in VR.

Vgl. auch im Folgenden Sina Tatzel 2024, Vorlesung Kommunikationssysteme

* * *

Durch die räumliche Darstellung von Schichten, Datenpaketen und Kommunikationspfaden kann das im Skript vermittelte Wissen anschaulich ergänzt und vertieft werden. Die theoreti- schen Grundlagen aus dem Modul Kommunikationssysteme bilden somit das notwendige Fun- dament für die Transformation der Lerninhalte in ein interaktives VR-basiertes Lernszenario.

## 2.3 Didaktische Grundlagen zur Entwicklung von Lehrinhalten

Dieses Kapitel skizziert die didaktischen Grundlagen, die dieser Arbeit zur Entwicklung von Lehrinhalten zugrunde liegen. Es stellt zunächst allgemeine Instruktionsdesignansätze vor, ergänzt diese um VR-spezifische Konzepte und führt anschließend die VRIN-Methode als Leit- faden zur Überführung und Integration bestehender Lehrinhalte in eine VR-gestützte Hoch- schulvorlesung ein.

## 2.3.1 Beispielhafte Konzepte des Instruktionsdesigns

Zur Entwicklung von Lehrinhalten schlägt die Literatur unter Anderem unterschiedliche An- sätze des Instruktionsdesigns vor. Zwei häufig diskutierte Konzepte sind ADDIE und SAM, die als allgemeine Rahmen zur systematischen Planung und Umsetzung von Lernangeboten die- nen, sich jedoch in ihrer Prozesslogik und ihrem Verständnis von Flexibilität unterscheiden. 23 ADDIE wird als Akronym für Analyze, Design, Develop, Implement und Evaluate beschrieben, zugleich aber ausdrücklich als Produktentwicklungsparadigma eingeordnet und nicht als ein- zelnes starres Modell. Der Ansatz wird auf intentionale Lernumgebungen bezogen und soll deren Komplexität adressieren, indem er auf Interaktionen innerhalb und zwischen Kontexten reagiert, während die grundlegenden Komponenten über unterschiedliche Anwendungen hin- weg stabil bleiben. 24 Kennzeichnend ist ein systematisches Vorgehen, das jedoch nicht als strikt vorgegebene Abfolge verstanden wird. Es wird betont, dass weder eine einzige korrekte Menge an Prozeduren noch eine einzig korrekte Reihenfolge existiert, da Vorgehen und Se- quenz in Abhängigkeit von Perspektive, Teamkonstellation und Kontextbedingungen variieren können. 25 Zugleich wird der Anspruch hervorgehoben, Entwicklungsergebnisse nicht nur zu erstellen, sondern auch zu prüfen. Jede Komponente erzeugt ein Deliverable, dass die kol- lektiven Überlegungen relevanter Stakeholder repräsentiert und vor der Weiterverwendung als Input für die nächste Komponente getestet wird. In normativer Hinsicht wird eine lernenden-

vgl. Branch 2009, S. 1; s. a. Jung 2019, S. 192 vgl. Branch 2009, S. 1 vgl. Ebd., S. 18 zentrierte Ausrichtung formuliert, wonach intentionales Lernen student-centered, innovativ, au- thentisch und inspirierend sein solle. SAM wird als Alternative zu traditionellen Instruktions- designs wie ADDIE vorgestellt und als Rapid Prototyping Methodologie gerahmt. Ausgangs- punkt ist der betonte Bedarf, E-Learning Inhalte in hoher Qualität bei reduziertem Zeit- und Kostenaufwand zu entwickeln, verbunden mit dem Hinweis, dass zahlreiche Lernangebote ohne angemessene Berücksichtigung der Bedürfnisse der Lernenden entstanden sind. 27 Im Kontrast zu einer als zu linear, zu unflexibel und zu zeitaufwendig beschriebenen Logik wird SAM als agiler Ansatz charakterisiert, der Geschwindigkeit, Flexibilität und Zusammenarbeit betont und damit effektivere sowie effizientere E-Learning Inhalte unterstützen soll. 28 Als zent- rales Merkmal wird die iterative Natur herausgestellt. Iteration ermögliche Experimentieren, Testen und Überarbeiten, und die Entwicklung in kleinen Schritten mit häufigen Evaluationen mache Veränderungen günstiger, weil Anpassungen frühzeitig und damit mit geringerem Auf- wand vorgenommen werden können. Darüber hinaus wird Zusammenarbeit als wesentlich be- schrieben, auch weil sich Einschätzungen von Stakeholdern im Projektverlauf verändern kön- nen, etwa hinsichtlich dessen, was erforderlich ist, was funktioniert, was benötigt wird und wer zur Zielgruppe zählt. Ein Vorgehen, das solche Veränderungen antizipiert und regelmäßig ak- tualisiert, wird in diesem Zusammenhang als besonders passend dargestellt. 29

## 2.3.2 Entwicklung von Lehrinhalten in Virtual Reality

Ergänzend werden für die Entwicklung von VR-Lehrinhalten spezifische Konzepte diskutiert, die die didaktischen und technischen Besonderheiten virtueller Umgebungen stärker in den Mittelpunkt stellen. Hierzu zählen VRID als Modell zur Konzeption und Umsetzung pädagogi- scher VR Umgebungen sowie FAIRI als Instruktionsdesign Vorschlag für adaptive immersive VR in trainingsbezogenen Kontexten. 30 VRID wird als Instructional Design und Development Model beschrieben, das Orientierung für die Entwicklung einer Educational Virtual Environ- ment geben soll. Zugleich wird betont, dass VR lediglich ein Werkzeug ist und nur dann einen didaktischen Mehrwert entfaltet, wenn es sorgfältig implementiert wird. 31 Als prägende Merk- male werden eine partizipative Teamstruktur einschließlich potenzieller Lernender sowie ein nicht lineares, iteratives Vorgehen hervorgehoben, bei dem Aufgaben abhängig von Rückmel- dungen mehrfach aufgegriffen werden können. 32 Darüber hinaus wird gefordert, die Eignung und Machbarkeit von VR für das jeweilige Lernproblem zu prüfen und bei der Gestaltung die Bedienbarkeit so auszurichten, dass die kognitive Belastung durch die Nutzung der Umgebung

26 vgl. Ebd., S. 2f. 27 vgl. Jung 2019, S.192 28 vgl. Ebd., S. 192f. vgl. Ebd., S. 193 vgl. Chen 2009, S.71, 80f.; s. a. Obourdin, De Maeyer, Van Den Bossche 2024, S. 1f. vgl. Chen 2009, S. 71, 73 vgl. Ebd., S. 82, 88 möglichst gering bleibt. FAIRI wird als Instruktionsdesign für adaptive immersive VR vorge- schlagen. Im Ausgangspunkt wird immersive VR als Technologie beschrieben, die glaubwür- dige, nahezu reale Erfahrungen ermöglichen kann, zugleich jedoch Herausforderungen wie cognitive load und self regulation verstärkt. 34 Zentrale Leitideen sind, immersive VR nur dort einzusetzen, wo der erhöhte Realismus einen klaren Mehrwert bietet, und die Intensität der Erfahrung durch adaptive Funktionen an die Ziele, Bedürfnisse und Präferenzen der Lernen- den anzupassen. 35 Ein Intelligent Tutoring System wird als Framework angeführt, um Lernin- teraktionen auszuwerten, Lernprobleme zu diagnostizieren und daraus Anpassungen der vir- tuellen Umgebung abzuleiten. Gleichzeitig wird betont, dass Lehrende für Implementation und angemessene Nutzung zentral bleiben und Immersive VR als Unterstützung und nicht als Er- satz verstanden werden soll. 36

## 2.3.3 Vorstellung der Virtual Reality Integration-Methode

Für diese Ausarbeitung wird die VRIN-Methode, verstanden als VR Integration, als Leitfaden genutzt, um bestehende Lehrinhalte in VR-Lehrinhalte zu überführen und anschließend in eine Hochschulvorlesung einzubetten. Die Methode wurde im Rahmen einer Doktorarbeit entwi- ckelt. Ziel ist es, VR nicht als isoliertes Zusatzangebot zu behandeln, sondern didaktisch stim- mig in den Ablauf der Veranstaltung zu integrieren. Die Methode setzt an zwei typischen Schwierigkeiten an. Erstens fehlt in der Praxis häufig eine verlässliche Vorgehensweise, um vorhandene Inhalte in VR geeignete Formate zu transformieren. Zweitens erfordert die Ent- wicklung VR gestützter Lehre eine enge Abstimmung zwischen fachlicher, didaktischer und technischer Perspektive, die ohne klare Struktur leicht zu Reibungsverlusten führt. VRIN be- gegnet dem, indem Rollen, Aktivitäten, Artefakte und Abstimmungspunkte definiert werden und damit sowohl den Informationsaustausch als auch die gemeinsame Entscheidungsfindung zwischen den Beteiligten unterstützt. Das Vorgehen ist phasenorientiert und lehnt sich an etab- lierte Instruktionsdesignmodelle wie ADDIE an. Zu Beginn wird die Ausgangssituation erho- ben. Dazu gehören der Anlass beziehungsweise die Motivation, VR in der Vorlesung einzu- setzen, sowie die Rahmenbedingungen der Veranstaltung. Darauf folgt die Festlegung der Zielsetzung und des Rahmens, indem zentrale Elemente der bestehenden Lehre systematisch beschrieben werden, etwa die Vorlesung, eine konkrete Lehreinheit sowie Inhaltsobjekte und Inhaltsfragmente; ergänzt wird dies durch organisatorische und VR bezogene Rahmenbedin- gungen. Aus dieser Grundlage werden Gestaltungsanforderungen abgeleitet, die die Konzep-

vgl. Ebd., S. 83, 85 vgl. Obourdin, De Maeyer, Van Den Bossche 2024, S. 1 ff. vgl. Ebd., S. 2f., 7 vgl. Ebd., S. 5f., 10 tion des VR-Lehrinhalts steuern. In der Konzeption werden VR spezifische Bestandteile aus- gearbeitet, insbesondere die VR-Umgebung, geeignete VR-Szenarien sowie VR-Inhaltsob- jekte und VR-Inhaltsfragmente. Anschließend wird der VR-Lehrinhalt technisch umgesetzt und schließlich in die Vorlesung integriert, sodass aus der bestehenden Vorlesung eine VR inte- grierte Vorlesung entsteht.

* * *

## Methodische Vorgehensweise zur Entwicklung eines Konzepts eines Virtual

**Reality-Lehrinhalts37**

Die Entwicklung des Konzepts für den VR-Lehrinhalt erfolgt in dieser Arbeit auf Grundlage der VRIN-Methode. Die Methode wird als strukturierender Bezugsrahmen eingesetzt, um vorhan- dene Lehrinhalte systematisch in VR-geeignete Lerninhalte zu überführen und deren spätere Einbettung in eine Hochschulvorlesung konzeptionell vorzubereiten. Gegenstand der Konzep- tion ist die Vermittlung von TCP/IP-Kommunikation, konkret Inhalte der Internet- und Trans- portschicht. Zur Umsetzung werden die in der VRIN-Methode vorgesehenen Templates ver- wendet. Diese dienen der standardisierten Erfassung relevanter Informationen, der transpa- renten Dokumentation getroffener Entscheidungen sowie der strukturierten Abstimmung zwi- schen den beteiligten fachlichen und didaktischen Perspektiven. Die empirische Grundlage zur Bearbeitung der Templates bilden zwei leitfadengestützte Interviews, jeweils eines mit ei- nem Lehrenden und eines mit einem Didaktiker. Diese Auswahl orientiert sich an der Logik der VRIN-Methode, die eine interdisziplinäre Perspektive und die frühzeitige Einbindung un- terschiedlicher Rollen vorsieht. Das Interview mit dem Lehrenden zielt primär auf die Erhebung der Inhalte, Lernziele und der organisatorischen Rahmenbedingungen der bestehenden Lehr- veranstaltung zur TCP/IP-Kommunikation sowie auf die Identifikation geeigneter Ansatzpunkte für einen VR-Einsatz. Das Interview mit dem Didaktiker dient der didaktischen Einordnung des VR-Einsatzes, insbesondere der Prüfung der Passung zwischen Lernzielen, Lernaktivitäten und VR-spezifischen Möglichkeiten, sowie der Ableitung entsprechender Gestaltungsanforde- rungen. Die Auswertung der Interviews erfolgt schrittweise durch die Überführung der erhobe- nen Informationen in die VRIN-Templates. Zunächst wird die Ausgangssituation der Lehrver- anstaltung einschließlich Motivation für den VR-Einsatz und relevanter Rahmenbedingungen beschrieben. Darauf aufbauend werden zentrale Elemente der bestehenden Lehre systema- tisch strukturiert, insbesondere die betrachtete Lehreinheit zu TCP/IP-Kommunikation sowie inhaltliche Bausteine, die als Grundlage für VR-Lehrinhalte herangezogen werden können. Aus dieser Analyse werden Gestaltungsanforderungen abgeleitet, die die Konzeption des VR- Lehrinhalts leiten. Abschließend werden VR-spezifische Bestandteile konzipiert, insbesondere die VR-Umgebung und VR-Szenarien sowie die inhaltliche Strukturierung innerhalb der VR- Anwendung. Ergebnis dieses Vorgehens ist ein konsistentes, über Templates dokumentiertes Konzept für einen VR-Lehrinhalt, das fachliche und didaktische Anforderungen integriert und als Grundlage für die nachfolgende Umsetzung und Integration in die Lehrveranstaltung dient. 38

Sprachlich geglättet durch ChatGPT 5.2 Vgl. Bisswang 2025

* * *

**Anforderungsanalyse**

In diesem Kapitel werden die Anforderungen an die geplante VR-Anwendung systematisch abgeleitet und strukturiert dargestellt. Grundlage bilden die theoretischen Erkenntnisse aus Kapitel zwei, sowie die Ergebnisse des leitfadengestützten Interviews mit einem Lehrenden. Ziel ist es, inhaltliche und technische Rahmenbedingungen klar zu definieren und als verbind- liche Basis für die anschließende Konzeption festzulegen.

## 4.1 Restriktion an die Virtual Reality Anwendung

Die Auswahl und Aufbereitung der Lehrinhalte für die geplante VR-Anwendung unterliegt meh- reren inhaltlichen Restriktionen, die sich aus den im Interview erhobenen Aussagen ergeben.

Zentrale Einschränkung stellt der begrenzte zeitliche Rahmen der Vorlesung dar, in die die Anwendung integriert werden soll. Da TCP/IP lediglich einen Teil des gesamten Vorlesungs- inhalts ausmacht und insgesamt nur wenige Stunden zur Verfügung stehen, ist eine umfas- sende oder tiefgehende Darstellung des Protokollstapels nicht realisierbar. Die VR-Anwen- dung muss sich daher auf ausgewählte, für das Grundverständnis zentrale Aspekte beschrän- ken.

Vor diesem Hintergrund wird die in der VR-Anwendung zu vermittelnde Darstellung auf die Schichten drei (Internet Layer) und vier (Transport Layer) des TCP/IP-Modells beschränkt. Diese Ebenen wurden im Interview als besonders relevant für das Verständnis der Kommuni- kation zwischen Sender und Empfänger sowie für den Weg eines Pakets durch das Netzwerk hervorgehoben. Niedrigere Schichten sowie detaillierte technische Aspekte, etwa auf Bit- oder Header-Ebene, stellen laut Interview keine vorrangigen Lernziele dar und sollen daher nicht Bestandteil der VR-Anwendung sein. Stattdessen ist eine abstrahierte Darstellung vorgese- hen, die das Prinzip der Paketvermittlung und die funktionale Rolle der jeweiligen Schichten verdeutlicht, ohne sich in technischen Einzelheiten zu verlieren.

Zusätzlich beeinflusst die begrenzte Vorbereitungszeit der Lehrenden die inhaltliche Gestal- tung der VR-Anwendung. Da Dozierende laut Interview nur eingeschränkt Zeit für die Aufbe- reitung und Integration neuer Lehrmaterialien aufbringen können, müssen die vermittelten In- halte bewusst einfach gehalten werden. Dies impliziert eine Konzentration auf grundlegende Konzepte, eine klare inhaltliche Fokussierung sowie den Verzicht auf komplexe oder voraus- setzungsreiche Darstellungen. Die VR-Anwendung soll fertige, leicht integrierbare Lehrinhalte bereitstellen und keine zusätzliche inhaltliche Vor- oder Nachbereitung durch die Lehrenden erfordern.

Schließlich ist auch die Heterogenität der Studierendengruppe als restriktiver Faktor für die Inhaltsauswahl zu berücksichtigen. Da im Interview beschrieben wird, dass ein erheblicher Teil der Studierenden über keine oder nur geringe Vorkenntnisse verfügt, dürfen die Lehrinhalte kein spezialisiertes Vorwissen voraussetzen. Fachbegriffe und Konzepte müssen auf ein ein- führendes Niveau begrenzt bleiben und primär dem Aufbau eines grundlegenden Verständ- nisses dienen. Vertiefende oder spezialisierte Inhalte sind demnach nicht Teil der über VR zu übermittelnden Lehrinhalte, sondern bleiben anderen Lehrformaten vorbehalten.

## 4.2 Meta-Anforderungen an die Umsetzung des Virtual Reality-Lehrinhalts

Dieses Kapitel formuliert Meta-Anforderungen an die Gestaltung und Umsetzung eines VR- Lehrinhalts zur Vermittlung von TCP IP Kommunikation in der Hochschullehre. Die Anforde- rungen leiten sich aus den in Kapitel 2.3 beschriebenen Instruktionsdesignansätzen ADDIE und SAM, den VR bezogenen Konzepten VRID und FAIRI sowie den VRIN spezifischen Rol- len, Artefakten und Abstimmungspunkten ab. Ergänzend werden lernpsychologische Zielkri- terien berücksichtigt, insbesondere erfahrungsbasiertes Lernen nach Kolb, Cognitive Load und Embodied Cognition, da diese maßgeblich beeinflussen, wie Interaktionen, Visualisierun- gen und Unterstützungsfunktionen technisch zu realisieren sind.

Im Themenfeld Lernzielorientierung und Modularisierung der VR-Szenarien ist sicherzustellen, dass die VR-Szenarien das Lernziel TCP/IP vermitteln und auf klar abgegrenzte Teilziele zu- geschnitten sind, sodass sie technisch als modulare und im Vorlesungsablauf gezielt einsetz- bare Einheiten umgesetzt werden können. Damit wird das Vorgehen der VRIN-Methode auf- gegriffen, die die Ableitung der Zielsetzung und des Rahmens aus der bestehenden Lehre als Ausgangspunkt der VR-Transformation vorsieht. Unter technischer Eignung, Machbarkeit und begründetem Einsatz von Immersion ist je Teilziel zu prüfen und zu dokumentieren, ob VR einen didaktischen Mehrwert liefert. Diese Forderung stützt sich einerseits auf VRID, welches eine sorgfältige und problemorientierte Implementierung als Voraussetzung hervorhebt und greift andererseits die FAIRI Leitidee auf, immersive VR auf Aufgaben zu beschränken, die tatsächlich vom erhöhten Realismus profitieren. Für Bedienbarkeit und Reduktion kognitiver Zusatzbelastung ist die VR-Umgebung so zu gestalten, dass Interaktionshürden minimiert wer- den und die Aufmerksamkeit auf TCP/IP Konzepten statt auf Bedienhandlungen liegt. Als Re- ferenz dient hier VRID, dass eine belastungsarme Bedienbarkeit explizit einfordert, während FAIRI Cognitive Load als zentrale Herausforderung immersiver Lernumgebungen markiert und damit die Relevanz einer entsprechenden technischen Ausgestaltung unterstreicht. Im Bereich Iterationsfähigkeit und Anpassbarkeit sollen die VR-Szenarien nicht strikt linear ausgelegt sein, sondern Wiederholungen und ein erneutes Aufgreifen von Aufgaben ermöglichen. Dieses Prin- zip lässt sich mit VRID begründen, dass ein nicht lineares und iteratives Vorgehen betont, und wird zugleich durch SAM gestützt, welches Rapid Prototyping und häufiges Testen als Mecha- nismen zur frühzeitigen und damit aufwandsärmeren Anpassung herausstellt. Hinsichtlich Pro- zess- und Qualitätssicherung über Deliverables ist pro Phase ein prüfbares Ergebnis vorzuse- hen, das vor der Weiterverwendung getestet wird. ADDIE liefert hierfür den Bezugsrahmen, da jede Komponente ein Deliverable erzeugen soll. Dieses Deliverable soll die kollektiven Überlegungen relevanter Stakeholder abbilden und vor der Nutzung als Input validiert werden. Unter Partizipation und Abstimmung in der Teamstruktur ist die Einbindung von Stakeholdern einschließlich potenzieller Lernender in Konzeption und Tests erforderlich. VRID verweist hier- bei auf die Bedeutung partizipativer Teamstrukturen, während SAM die Notwendigkeit enger Zusammenarbeit insbesondere deshalb betont, weil sich Einschätzungen, Anforderungen und Zielgruppenverständnis im Projektverlauf verändern können. In Bezug auf Ableitung aus be- stehender Lehre und Integration in den Vorlesungskontext sollen Gestaltungsanforderungen unmittelbar aus Vorlesung, Lehreinheit und Inhalten abgeleitet werden, damit die VR-Umset- zung kohärent zur bestehenden Lehre bleibt und nicht als isoliertes Zusatzangebot wirkt. Diese Ausrichtung entspricht dem Kernanliegen der VRIN-Methode, VR didaktisch stimmig in den Ablauf der Veranstaltung einzubetten. Ergänzend verweist FAIRI darauf, dass Lehrende für Implementierung und angemessene Nutzung zentral bleiben und immersive VR als Unterstüt- zung zu verstehen ist, woraus Anforderungen an Steuerbarkeit und Einbettung der Anwen- dung in die Lehrorganisation folgen. Abschließend verlangt die Erfassung von Lerninteraktio- nen für Diagnostik und Rückkopplung, dass Nutzerhandlungen technisch so protokolliert wer- den, dass Lernprobleme identifizierbar sind und daraus Anpassungen abgeleitet werden kön- nen. Als theoretische Grundlage kann FAIRI herangezogen werden, das zur Auswertung von Lerninteraktionen und zur Ableitung adaptiver Anpassungen ein diagnostisches Framework als Referenzrahmen anführt.

## 4.3 Einordnung der Meta-Anforderungen für eine spätere Evaluation

Im Rahmen der Anforderungsanalyse wurden Restriktionen und Meta-Anforderungen an die geplante VR-Anwendung erarbeitet. Damit die spätere Evaluation des Systems zielgerichtet erfolgen kann, ist es notwendig, diese Anforderungen nach ihrer Bedeutung zu priorisieren. Die folgende Einordnung stellt dar, welche Kriterien für die Wirksamkeit und den Erfolg der Anwendung besonders entscheidend sind und welche eher unterstützenden Charakter besit- zen.

Als sehr wichtig gelten zunächst alle Anforderungen, die unmittelbar mit dem Lernziel der An- wendung verbunden sind. Zentral ist insbesondere die verständliche Vermittlung grundlegen- der Netzwerkprozesse des TCP/IP-Modells. Die Anwendung muss es Studierenden ermögli- chen, abstrakte Inhalte wie Paketübertragung, Adressierung oder Routing anschaulich nach- zuvollziehen. Ebenfalls essenziell ist der interaktive Charakter der Lernumgebung: Lernende sollen Netzwerkkommunikation nicht nur beobachten, sondern aktiv durch Handlungen wie Greifen, Zuordnen und Weiterleiten von Datenpaketen erleben können. Diese beiden Punkte stellen die Grundlage des didaktischen Mehrwerts dar und müssen daher im Fokus einer spä- teren Evaluation stehen.

Als wichtig werden Anforderungen eingeordnet, die den Lernprozess unterstützen und verbes- sern. Dazu zählt vor allem ein geeignetes Feedbacksystem, durch das Nutzer unmittelbar Rückmeldung über ihre Entscheidungen erhalten. Dies hilft dabei, Fehler schneller zu erken- nen und den Lernfortschritt besser einzuschätzen. Auch die intuitive Bedienbarkeit der VR- Umgebung spielt eine große Rolle, da eine komplizierte Steuerung den Lernerfolg beeinträch- tigen könnte. Ebenso wichtig ist die Integration der Anwendung in bestehende Lehrveranstal- tungen, da VR nur dann sinnvoll ist, wenn sie klassische Formate ergänzt und didaktisch ein- gebettet bleibt.

Eine Stufe darunter liegen Anforderungen, die als mäßig wichtig bewertet werden. Hierzu ge- hören beispielsweise technische Erweiterungen oder zusätzliche Detailfunktionen, die zwar den Realismus oder die Vielfalt der Simulation erhöhen könnten, aber nicht zwingend notwen- dig sind, um die grundlegenden Lernziele zu erreichen. Solche Aspekte können die Nutzerer- fahrung verbessern, stehen jedoch nicht im Mittelpunkt der Kernfunktion.

Als weniger wichtig für die erste Evaluation gelten Anforderungen, die primär kosmetischer oder optionaler Natur sind. Dazu zählen etwa aufwendige grafische Detailverbesserungen oder zusätzliche Szenarien, die über den grundlegenden Lerninhalt hinausgehen. Diese Punkte können langfristig relevant werden, sollten jedoch erst nach erfolgreicher Umsetzung und Überprüfung der Hauptanforderungen betrachtet werden.

* * *

**Konzeption**

Aufbauend auf der zuvor durchgeführten Anforderungsanalyse beschreibt dieses Kapitel die Konzeption der VR-Anwendung sowie die Entwicklung der einzelnen VR-Szenarien. Ziel ist es, den didaktischen Aufbau der Anwendung sowie die zugrunde liegenden konzeptionellen Entscheidungen transparent darzustellen. In diesem Fall wurden Anforderungen aus den Meta-Anforderungen und Restriktionen abgeleitet und sind direkt in die Szenarien eingeflos- sen, ohne diese erneut zu dokumentieren. Gemäß der VRIN-Methode schließt sich an die Anforderungsdefinition in Phase drei, die Ausarbeitung konkreter VR-Szenarien, an. Üblicher- weise erfolgt dieser Schritt im Rahmen eines Workshops unter Beteiligung einer lehrenden Person sowie einer Person mit pädagogisch-didaktischer Expertise. Aufgrund zeitlicher Rest- riktionen konnte ein solcher Workshop im vorliegenden Projekt nicht durchgeführt werden. Stattdessen wurde der Prozess in mehrere aufeinanderfolgende Arbeitsschritte unterteilt. Im ersten Schritt, dem Kick-off, wurden die Ergebnisse der leitfadengestützten Interviews als ver- bindliche Rahmenbedingungen festgelegt. Darauf aufbauend wurden im zweiten Schritt erste konzeptionelle Überlegungen zur Gestaltung der VR-Szenarien in Form eines Moodboards visualisiert. Das Moodboard diente dazu, das Themengebiet einer spezifischen Wissensart zuzuordnen und dadurch grundlegende Vorstellungen über die didaktische Ausrichtung und den Grad der Abstraktion der VR-Anwendung zu entwickeln. Aus dem Interview ging hervor, dass der Einsatz der VR-Anwendung primär dem Aufbau eines grundlegenden Prozessver- ständnisses dienen soll und nicht der detaillierten Vermittlung einzelner technischer Aspekte. Vor diesem Hintergrund wurde bewusst eine abstrahierte virtuelle Umgebung gewählt. Der im Interview gewonnene Input floss zudem in erste Überlegungen zur visuellen Gestaltung und zur Art der Abstraktion ein. Als geeignetes Metaphern Modell erwies sich der Auslieferungs- prozess von Paketen, da sich mit diesem Ansatz die zentralen Prinzipien der TCP/IP-Kommu- nikation anschaulich und nachvollziehbar darstellen lassen. Nachdem damit sowohl der über- geordnete Prozess als auch die virtuelle Umgebung der Anwendung konzeptionell festgelegt waren, folgte im nächsten Schritt die detaillierte Ausarbeitung der VR-Szenarien. 39

Die Szenarien lassen sich in drei Kategorien unterteilen:

- Steuer-Szenarien, die der Aktivierung, Orientierung und Ablaufsteuerung der Lernen- den dienen. Diese Szenarien verfolgen keinen direkten Lernzielbezug.
- Lern-Szenarien, die den zentralen didaktischen Kern der Anwendung bilden. In diesen Szenarien handeln die Lernenden aktiv, sammeln Erfahrungen und bauen Kompeten- zen auf.
  Vgl. auch im Folgenden Bisswang, Miroboard 2025

* * *

- Bewertungsszenarien, die der Überprüfung, Reflexion und Messung der Lernergeb- nisse dienen.
  _Abb. 1: Konzeptumgebung Steuer-Szenario40_ Das Steuer-Szenario dient der initialen Einführung in die VR-Anwendung und stellt den ersten Kontakt der Lernenden mit der virtuellen Umgebung dar. Ziel dieses Szenarios ist es, Orien- tierung zu geben, die technische Bedienung zu vermitteln und Transparenz über den weiteren Ablauf der Anwendung zu schaffen. Zu Beginn werden die Lernenden durch einen Avatar be- grüßt, der das übergeordnete Lernziel der Anwendung erläutert. Dieses besteht im Verständ- nis der Internet- und Transportschicht des TCP/IP-Protokolls. Gleichzeitig wird kommuniziert, dass im weiteren Verlauf TCP/IP-bezogene Aufgaben zu lösen sind, um die einzelnen Pro- zessschritte erfolgreich zu durchlaufen. Darüber hinaus erfolgt eine Einführung in die Naviga- tion innerhalb der VR-Umgebung. Die Lernenden haben die Möglichkeit, die Steuerung ken- nenzulernen, Bewegungen im Raum zu erproben und sich mit den grundlegenden Interakti- onsmechanismen vertraut zu machen. Durch diese Phase wird sichergestellt, dass technische Unsicherheiten nicht die nachfolgenden Lernszenarien beeinträchtigen. Nach Abschluss der Einführung wird durch eine visuelle Rückmeldung „Lass uns beginnen! Du wirst bereits im Lagerhaus erwartet.“ der Übergang in das erste Lern-Szenario eingeleitet. Dieser erfolgt über eine Teleportation in die virtuelle Lagerhalle. Als Ergebnis dieses Szenarios sollen die Lernen- den die Steuerung der Anwendung sicher beherrschen. Der zeitliche Umfang beträgt etwa zwei Minuten. 41

Die Lern-Szenarien bilden den didaktischen Kern der VR-Anwendung. In ihnen erwerben die Lernenden durch aktives Handeln ein konzeptuelles Verständnis zentraler TCP/IP-Prinzipien. Die Szenarien sind so gestaltet, dass abstrakte Netzwerkprozesse durch eine greifbare Ana- logie erfahrbar gemacht werden.

Erstellt mit Gemini Vgl. Anhang 1

* * *

_Abb. 2: Konzeptumgebung Lern-Szenario 1_ _42_

Im ersten Lern-Szenario werden die Lernenden in die Rolle eines Lagerarbeiters versetzt. Ziel dieses Szenarios ist es, den Zusammenhang zwischen IP-Adressen und der korrekten Zustel- lung von Datenpaketen zu verstehen. Die IP-Adresse wird dabei als entscheidendes Merkmal der Adressierung im Netzwerk vermittelt, analog zur Postadresse im Versandprozess. Die Ler- nenden erhalten einen Lieferschein, auf dem Paketnummern sowie zugehörige Zieladressen vermerkt sind. Auf dieser Grundlage müssen sie gezielt Pakete aus Regalen entnehmen und korrekt auf Paletten platzieren, die den jeweiligen Lieferwagen zugeordnet sind. Die aktuelle Aufgabe wird dauerhaft im oberen linken Bereich des Sichtfeldes angezeigt, um eine klare Orientierung sicherzustellen. Die Interaktion erfolgt durch das Greifen und Platzieren virtueller Objekte mithilfe von Maus und Tastatur. Bei korrekt ausgeführten Aktionen erhalten die Ler- nenden unmittelbares Feedback: Visuell wird der entsprechende Eintrag auf dem Lieferschein durchgestrichen, auditiv bestätigt der Avatar die korrekte Auswahl. Nach erfolgreicher Bear- beitung aller auf dem Lieferschein angegebenen Pakete wird eine Bestätigungsmeldung ein- geblendet. Das Bestätigen der Meldung leitet den Übergang zum nächsten Lern-Szenario ein. Der zeitliche Umfang dieses Szenarios beträgt etwa fünf Minuten. 43

Erstellt mit Gemini Vgl. Anhang 2/1

* * *

_Abb. 3: Konzeptumgebung Lern-Szenario 2_ _44_

Im zweiten Lern-Szenario werden die Lernenden mit einer realitätsnahen Störung im Kommu- nikationsprozess konfrontiert. Ein Empfänger meldet über ein Computersystem, dass be- stimmte Pakete nicht angekommen sind. Die Aufgabe der Lernenden besteht darin, diese feh- lenden Pakete zu identifizieren und erneut zu versenden. Mit diesem Szenario wird das Kon- zept von Paketverlusten sowie der erneuten Übertragung eingeführt, dass ein zentrales Ele- ment der TCP/IP-Kommunikation darstellt. Die Lernenden erfahren, dass Zuverlässigkeit und Fehlerbehandlung wesentliche Eigenschaften moderner Netzwerke sind und nicht jede Über- tragung fehlerfrei verläuft. Nach erfolgreicher Wiederversendung der verlorengegangenen Pa- kete wird eine Erfolgsmeldung angezeigt. Diese signalisiert den Abschluss der Lernphase und leitet den Übergang in das Bewertungsszenario ein. 45

_Abb. 4: Konzeptumgebung Bewertungs-Szenario46_ Das Bewertungsszenario stellt den abschließenden Abschnitt der VR-Anwendung dar und dient der Überprüfung der in den Lern-Szenarien erworbenen Kompetenzen. Die Lernenden

Erstellt durch Gemini Vgl. Anhang 2/2 Erstellt durch Gemini bearbeiten hierbei eine komplexere Aufgabe, die auf denselben Grundprinzipien basiert wie die vorherigen Szenarien. Im Vergleich zum Tutorial ist die Anzahl der zu verarbeitenden Pa- kete erhöht, ebenso variiert die Zahl der Zielempfänger und Versandstationen. Der grundle- gende Ablauf, das Lesen des Lieferscheins, die Entnahme der Pakete sowie deren korrekte Zuordnung, bleibt jedoch unverändert, um Kontinuität und Wiedererkennung zu gewährleisten. Die Leistung der Lernenden wird anhand mehrerer Kriterien bewertet. Für korrekt zugeordnete Pakete werden Punkte vergeben, während falsch platzierte Pakete zu Punktabzügen führen. Zusätzlich fließt die Bearbeitungsgeschwindigkeit in die Bewertung ein. Ein integrierter Timer erzeugt dabei einen kompetitiven Anreiz und fördert eine effiziente Arbeitsweise. Am Ende des Szenarios wird die erreichte Punktzahl in Relation zur maximal möglichen Punktzahl gesetzt und durch eine verbale Bewertung des Avatars Markus ergänzt. Diese reicht von „Gut“ bis „Perfekt“. Den Lernenden wird anschließend ihre Gesamtleistung inklusive Zeit und Punkte- stand angezeigt. Optional können sie das Szenario erneut starten oder in den Trainingsmodus zurückkehren. Der zeitliche Umfang des Szenarios liegt zwischen fünf und zehn Minuten. 47

Nach der Entwurfsphase wurden die Szenarien gemeinsam mit einer didaktischen Fachkraft besprochen und weiterentwickelt. Ziel war es sicherzustellen, dass die entworfenen Inhalte auch wirklich zum geplanten Lernziel führen. Diese Prüfung bestätigte die Eignung des An- satzes, insbesondere im Hinblick auf die Ergebnisse der Anforderungsanalyse. Da die VR- Anwendung die bestehenden Vorlesungen lediglich ergänzen soll, konzentriert sich der In- halt gezielt auf die Organisation des Datenaustauschs zwischen Sender und Empfänger so- wie die Fehlerbehandlung. Nach Einschätzung der Expertin sind das Lernziel, die Aufgaben für die Lernenden, das Feedback und das erwartete Ergebnis dabei stimmig miteinander ver- knüpft. Neben den didaktischen Fragen wurde auch die technische Machbarkeit geklärt. Ein besonders wichtiger Aspekt war dabei die Barrierefreiheit. Um sicherzustellen, dass auch Nutzer mit Einschränkungen, wie einer Rot-Grün-Sehschwäche, die Software verwenden können, wird sich die Entwicklung an der Verordnung BITV 2.0 orientieren. Ein weiterer Dis- kussionspunkt war die Sicherheit. Es stellte sich die Frage, wie man damit umgeht, wenn Lernende mit aufgesetzter VR-Brille versehentlich zusammenstoßen. Da jedoch bewusst eine nicht-immersive VR-Anwendung gewählt wurde, um unter anderem die kognitive Belas- tung der Lernenden gering zu halten, besteht kein Risiko für solche Unfälle. Entsprechende Notfall-Szenarien sind daher nicht notwendig. Zusammenfassend gaben die Analyse der Szenarien und das Feedback der Fachkraft eine klare Richtung für die technische Umset- zung vor.

Vgl. Anhang 3

* * *

## Ausblick zur Umsetzung48

Die in dieser Arbeit entwickelte Konzeption stellt eine fundierte Grundlage für die spätere tech- nische Umsetzung der VR-Anwendung zur Vermittlung von TCP/IP-Kommunikation dar. Im nächsten Schritt sollte das Konzept in einen funktionierenden Prototyp überführt werden, der in der Hochschullehre praktisch eingesetzt und evaluiert werden kann. Dabei ist insbesondere wichtig, dass die Anwendung nicht als isoliertes Zusatzangebot verstanden wird, sondern ge- zielt in den bestehenden Lehrinhalt der Veranstaltung „Kommunikationssysteme“ eingebettet wird.

Eine sinnvolle Integration in die Lehrveranstaltung könnte so erfolgen, dass die VR-Anwen- dung nach der theoretischen Einführung des TCP/IP-Modells eingesetzt wird. Studierende er- werben in der Vorlesung zunächst die Grundlagen zu Internet- und Transportschicht, während die VR-Umgebung anschließend dazu dient, die Abläufe praktisch erfahrbar zu machen. Ge- rade weil viele Prozesse in Netzwerken abstrakt bleiben, kann die räumliche und interaktive Darstellung in VR helfen, zentrale Konzepte wie Adressierung, Paketvermittlung oder Fehler- behandlung besser zu verstehen. Die Anwendung würde somit nicht die Vorlesung ersetzen, sondern als ergänzende Lernphase das konzeptuelle Verständnis vertiefen.

Für den Einsatz im Lehrbetrieb ist zudem eine strukturierte Vorbereitung notwendig. Vor der eigentlichen Nutzung sollten die Studierenden eine kurze Einführung erhalten, sowohl zur Be- dienung der Anwendung als auch zu den Lernzielen. Das bereits konzipierte Steuer-Szenario übernimmt hierbei eine zentrale Rolle, da es technische Unsicherheiten abbaut und den Ein- stieg erleichtert. Ebenso sollte organisatorisch sichergestellt werden, dass geeignete Geräte, Räumlichkeiten und ein technischer Support zur Verfügung stehen, um einen reibungslosen Ablauf zu ermöglichen.

Auch eine Nachbereitung im Anschluss an die VR-Einheit ist didaktisch sinnvoll. Die im Be- wertungsszenario erzielten Ergebnisse könnten beispielsweise in einer kurzen Reflexions- phase aufgegriffen werden, um typische Fehler oder offene Fragen gemeinsam zu bespre- chen. Dadurch wird die VR-Erfahrung stärker mit dem restlichen Vorlesungsinhalt verknüpft und langfristiger Lernerfolg unterstützt. Eine Kombination aus VR-Übung und anschließender Diskussion oder Aufgabenbearbeitung wäre daher besonders effektiv.

Insgesamt bietet das entwickelte Konzept eine realistische und didaktisch sinnvolle Perspek- tive für den Einsatz immersiver Lerntechnologien in der Netzwerklehre. Die nächsten Schritte bestehen vor allem in der technischen Entwicklung und der praktischen Erprobung im Hoch- schulkontext.

Sprachlich geglättet durch ChatGPT 5.2

* * *

**Anhang**
Anhang 1: Steuer-Szenario ... 24
Anhang 2/1: Lern-Szenario ... 25
Anhang 2/2: Lern-Szenario ... 26
Anhang 3: Bewertungs-Szenario ... 27

## Anhang 1: Steuer-Szenario

* * *

## Anhang 2/1: Lern-Szenario

* * *

## Anhang 2/2: Lern-Szenario

* * *

## Anhang 3: Bewertungs-Szenario

* * *

**Literaturverzeichnis**

Bisswang, Nadine 2025. _Gruppe8\_VR-TCP/IP (VRIN-Methode und Vorlagen),_ [https://miro.com/app/board/uXjVGVPP8Eo=](https://miro.com/app/board/uXjVGVPP8Eo=) (Zugriff vom 29.1.2026).

Branch, Robert Maribe 2009. Instructional Design: The ADDIE Approach. Boston, MA: Springer US.

Calvert, James; Abadia, Rhodora 2020. »Impact of immersing university and high school students in educational linear narratives using virtual reality technology«, in Computers & Education 159, S. 104005.

Chen, Chwen Jen 2009. »Theoretical Bases for Using Virtual Reality in Education«.

Jung, Hyojung 2019. »Advanced Instructional Design for Successive E-learning: based on the Successive Approximation Model (SAM)«, in International Journal on E- _Learning 18, 2, S. 191–204._

Kishino, Fumio o. J. . » [http://vered.rose.utoronto.ca/people/paul\_dir/IEICE94/ie-](http://vered.rose.utoronto.ca/people/paul_dir/IEICE94/ie-) ice.htm«.

Obourdin, Gilles; De Maeyer, Sven; Van Den Bossche, Piet 2024. »Unlocking the power of immersive learning: The FAIRI instructional design proposition for adaptive immersive virtual reality«, in Computers & Education: X Reality 5, S. 100084.

Saltzer, J. H.; Reed, D. P.; Clark, D. D. 1984. »End-to-end arguments in system de- sign«, in ACM Transactions on Computer Systems 2, 4, S. 277–288.

Steuer, Jonathan o. J. . »Defining Virtual Reality: Dimensions Determining Telepresence«.

Stracke, Christian M. et al. 2025. »Immersive virtual reality in higher education: a sys- tematic review of the scientific literature«, in Virtual Reality 29, 2, S. 64.

Sweller, John; Van Merrienboer, Jeroen J. G.; Paas, Fred G. W. C. 1998. »Cognitive Architecture and Instructional Design«, in Educational Psychology Review 10, 3, S. 251–296.

Tanenbaum, Andrew S.; Feamster, Nick; Wetherall, David 2021. Computer networks. Sixth edition, Global Edition. Harlow, United Kingdom: Pearson.

Trick, Ulrich; Weber, Frank 2011. SIP, TCP/IP und Telekommunikationsnetze: Anfor- _derungen-Protokolle-Architekturen. 4., überarb.und erw. Aufl. München: De_ Gruyter.

Wikipedia 2025. ARPANET, [https://de.wikipedia.org/w/index.php?title=ARPANET&ol-](https://de.wikipedia.org/w/index.php?title=ARPANET&ol-) did=262584925 (Zugriff vom 29.1.2026).

Zyda, Michael; DeFanti, Tom 2003. »Praise for Understanding Virtual Reality: Inter- face, Application, and Design«, in Understanding Virtual Reality, S. i. Elsevier.

* * *

Erklärung zur Verwendung generativer KI-Systeme

Bei der Erstellung der eingereichten Arbeit habe ich auf künstlicher Intelligenz (KI) basierte
Systeme benutzt:

☒ ja
☐ nein

☐ nein

Falls ja: Die nachfolgend aufgeführten auf künstlicher Intelligenz (KI) basierten Systeme habe
ich bei der Erstellung der eingereichten Arbeit benutzt:

2. ChatGPT

3. Perplexity

4. Perplexity


Ich erkläre, dass ich
• mich aktiv über die Leistungsfähigkeit und Beschränkungen der oben genannten

• mich aktiv über die Leistungsfähigkeit und Beschränkungen der oben genannten
KI-Systeme informiert habe,
• die aus den oben angegebenen KI-Systemen direkt oder sinngemäß übernommenen

• die aus den oben angegebenen KI-Systemen direkt oder sinngemäß übernommenen
Passagen gekennzeichnet habe,
• überprüft habe, dass die mithilfe der oben genannten KI-Systeme generierten und von

• überprüft habe, dass die mithilfe der oben genannten KI-Systeme generierten und von
mir übernommenen Inhalte faktisch richtig sind,
• mir bewusst bin, dass ich als Autorin bzw. Autor dieser Arbeit die Verantwortung für die

• mir bewusst bin, dass ich als Autorin bzw. Autor dieser Arbeit die Verantwortung für die
in ihr gemachten Angaben und Aussagen trage.

Die oben genannten KI-Systeme habe ich wie im Folgenden dargestellt eingesetzt:

| Arbeitsschritt in der wissenschaftlichen Arbeit | Eingesetzte(s) Kl- System(e) | Beschreibung der Verwendungsweise |
| --- | --- | --- |
| Erstellung von Bildern | Gemini 3 | Beispielhafte Bilder für die Konzeption wurden durch Gemini 3 erstellt |
| Sprachliche Glättung | ChatGPT 5.2 | Textabschnitte mit ChatGPT sprachlich geglättet |
| Literaturrecherche | Perplexity | Literaturrecherche mithilfe von Perplexity |
|  |  |  |

(Die Tabelle ist im Bedarfsfall zu erweitern und auf den Folgeseiten fortzusetzen)

Stuttgart, 04.02.2026
(Ort, Datum)

Stuttgart, 04.02.2026
(Ort, Datum)

Stuttgart, 04.02.2026
(Ort, Datum)

Stuttgart, 04.02.2026
(Ort, Datum)

* * *

**Erklärung**

Ich versichere hiermit, dass ich die vorliegende Arbeit mit dem Thema: Vermittlung von IT- _Konzepten an Hochschulen am Beispiel der TCP/IP-Kommunikation: Konzeption und Umset-_ _zung einer VR-Anwendung_