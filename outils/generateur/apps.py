# Pages exigées pour publier les apps sur l'App Store : une politique de confidentialité par app
# (realisations/<app>/confidentialite/) et une page d'assistance commune (assistance/).
# Les données décrites ici viennent du code des apps (autorisations Info.plist, frameworks, absence de réseau
# et de SDK tiers), relu le 26 novembre 2026. Si une app change (pub, compte, serveur, statistiques), mettre
# à jour sa fiche AVANT de publier la nouvelle version.
# Usage (depuis la racine du dépôt, après gen.py) : python3 outils/generateur/apps.py .
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen

SITE = sys.argv[1] if len(sys.argv) > 1 else '.'
O = gen.O
MAJ = '26 novembre 2026'
MAIL = 'mtxstudio@proton.me'
EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

def mail(app, objet):
    return gen.mailto(f'{objet} · {app}', f'Bonjour,\n\nApp : {app}\nAppareil et version du système :\n\nMa question ou le problème rencontré :\n\n')

# Chaque app : nom, dossier du site, appareils, ce qu'elle fait, autorisations (nom affiché par le système,
# usage, où restent les données), données stockées, services Apple concernés, suppression.
APPS = [
    dict(slug='foulee', nom='GoRun', appareils='iPhone et Apple Watch', systeme='iOS 27 et watchOS 27 ou plus récents',
         resume='GoRun enregistre vos courses (tracé, distance, allure, fréquence cardiaque) et vous fait courir contre votre record.',
         autorisations=[
             ('Position', 'Tracer la course, mesurer la distance et l’allure, y compris écran verrouillé pendant une course en cours.', 'Sur l’appareil'),
             ('Santé (lecture)', 'Afficher vos pas, votre activité, votre fréquence cardiaque, vos calories et les courses enregistrées par d’autres apps.', 'Dans l’app Santé d’Apple'),
             ('Santé (écriture)', 'Enregistrer vos courses et leur tracé dans l’app Santé, si vous l’acceptez.', 'Dans l’app Santé d’Apple'),
             ('Mouvements et forme', 'Mesurer vos pas et votre cadence pendant la course.', 'Sur l’appareil'),
             ('Photos (ajout seulement)', 'Enregistrer l’image d’une course dans Photos, quand vous le demandez. L’app ne lit pas votre photothèque.', 'Dans votre photothèque'),
         ],
         stockage='Vos courses, records et réglages sont enregistrés sur l’iPhone et l’Apple Watch, qui se les échangent directement. Un export GPX n’est créé que si vous le demandez, et vous choisissez où l’envoyer.',
         apple='Les données de Santé sont gérées par Apple dans l’app Santé, chiffrées sur l’appareil. Vous pouvez à tout moment retirer l’accès de GoRun dans Réglages > Santé > Accès aux données et appareils.',
         suppression='Supprimez une course depuis l’app, ou supprimez l’app pour effacer toutes ses données. Les courses déjà écrites dans Santé se suppriment depuis l’app Santé.'),
    dict(slug='space', nom='Space', appareils='iPhone', systeme='iOS 18 ou plus récent',
         resume='Space est un jeu d’arcade à un doigt, sans compte.',
         autorisations=[],
         stockage='Votre progression (meilleur score, gemmes, missions, réglages) est enregistrée sur l’iPhone.',
         apple=None,
         note='La version actuelle n’affiche aucune publicité réelle et ne contient aucun outil publicitaire, de mesure d’audience ou de suivi. Si une version future intègre de la publicité, cette page sera mise à jour avant sa publication et l’app vous demandera votre accord quand la loi l’exige.',
         suppression='Supprimez l’app pour effacer votre progression.'),
    dict(slug='viewer', nom='MTX Viewer', appareils='iPhone et iPad', systeme='iOS 27 ou plus récent',
         resume='MTX Viewer ouvre un site web, un dossier de site ou un serveur de développement pour l’inspecter sur un vrai appareil.',
         autorisations=[
             ('Réseau local', 'Afficher les sites servis depuis votre ordinateur (serveur de développement) sur le même réseau.', 'Rien n’est conservé par le studio'),
             ('Photos (ajout seulement)', 'Enregistrer les captures d’écran de vos sites dans Photos, quand vous le demandez.', 'Dans votre photothèque'),
         ],
         stockage='Votre bibliothèque de sites (adresses, dossiers importés, réglages) reste sur l’appareil.',
         apple=None,
         note='Quand vous ouvrez un site, votre appareil se connecte directement à ce site, comme dans un navigateur : ce site reçoit les informations techniques habituelles (adresse IP, type d’appareil) et applique sa propre politique de confidentialité.',
         suppression='Retirez un site de la bibliothèque depuis l’app, ou supprimez l’app pour tout effacer.'),
    dict(slug='triade', nom='Triade', appareils='iPhone et iPad', systeme='iOS 27 ou plus récent',
         resume='Triade réunit traitement de texte, tableur et présentation, hors ligne, avec un assistant qui fonctionne sur l’appareil.',
         autorisations=[
             ('Appareil photo', 'Numériser un document papier pour le transformer en texte modifiable. La reconnaissance du texte se fait sur l’appareil.', 'Sur l’appareil'),
             ('Face ID', 'Verrouiller Triade si vous activez cette option. Votre visage est vérifié par iOS : l’app ne reçoit qu’une réponse « oui » ou « non ».', 'Géré par iOS'),
             ('Photos (sélection)', 'Insérer une image que vous choisissez. L’app ne voit que les images sélectionnées.', 'Dans vos documents'),
         ],
         stockage='Vos documents restent sur votre appareil, à l’emplacement où vous les enregistrez. L’assistant de rédaction utilise le modèle d’Apple Intelligence qui tourne sur l’appareil : vos textes ne sont envoyés à aucun serveur du studio ni à un service d’IA en ligne.',
         apple=None,
         suppression='Supprimez vos documents depuis l’app ou l’app Fichiers, ou supprimez l’app.'),
    dict(slug='kompagnion', nom='Kompagnion', appareils='iPhone', systeme='iOS 27 ou plus récent',
         resume='Kompagnion réunit clients, projets, demandes et documents d’une petite entreprise dans l’iPhone.',
         autorisations=[
             ('Photos (sélection)', 'Joindre une image que vous choisissez (logo, pièce jointe). L’app ne voit que les images sélectionnées.', 'Sur l’appareil'),
         ],
         stockage='Les fiches clients, projets, demandes et documents que vous saisissez sont enregistrés uniquement sur l’iPhone. Ces informations peuvent concerner vos propres clients : vous en restez responsable, et le studio n’y a jamais accès.',
         apple=None,
         suppression='Supprimez une fiche depuis l’app, ou supprimez l’app pour tout effacer.'),
    dict(slug='mue', nom='Mue', appareils='Mac', systeme='macOS 27 ou plus récent',
         resume='Mue convertit, retouche et range vos fichiers en les glissant, sans quitter le Mac.',
         autorisations=[
             ('Accès aux dossiers (Bureau, Documents, Téléchargements, volumes externes et réseau)', 'Lire le fichier que vous glissez et enregistrer le fichier converti à côté.', 'Sur le Mac'),
         ],
         stockage='Les conversions se font sur le Mac. Aucun fichier n’est envoyé en ligne.',
         apple=None,
         suppression='Supprimez l’app : elle ne garde que ses réglages.'),
]

def table_autorisations(a):
    if not a['autorisations']:
        return '<p>Aucune. Space ne demande ni position, ni photos, ni micro, ni contacts.</p>'
    rows = ''.join(f'<div><dt>{n}</dt><dd>{u} <span class="muted">Où restent les données&#8239;: {o if o.startswith("Rien") else o[0].lower() + o[1:]}.</span></dd></div>' for n, u, o in a['autorisations'])
    return f'<dl>{rows}</dl>\n      <p>Chaque autorisation est demandée au moment où la fonction sert, et se retire dans les Réglages de l’appareil. Refuser n’empêche pas d’utiliser le reste de l’app.</p>'

def page_confidentialite(a):
    root = '../../../'
    nom = a['nom']
    extra = f'\n      <h2>Bon à savoir</h2>\n      <p>{a["note"]}</p>' if a.get('note') else ''
    apple = f'\n      <h2>Services d’Apple</h2>\n      <p>{a["apple"]}</p>' if a.get('apple') else ''
    body = f'''<div class="text-page">
  <div class="wrap">
    <header class="text-head">
      <nav aria-label="Fil d’Ariane"><ol class="crumbs"><li><a href="{root}">MTX Studio</a></li><li><a href="../">{nom}</a></li><li aria-current="page">Confidentialité</li></ol></nav>
      <h1 class="d1">Confidentialité de {nom}.</h1>
      <p class="lede">{a["resume"]} Voici, autorisation par autorisation, ce que l’app utilise et où vont vos données.</p>
    </header>

    <div class="text-body">
      <h2>En bref</h2>
      <ul>
        <li>{nom} ne collecte aucune donnée pour MTX Studio&#8239;: pas de compte, pas de serveur, pas de statistiques, pas de publicité.</li>
        <li>Ce que vous enregistrez dans l’app reste sur votre appareil.</li>
        <li>Rien n’est vendu, loué ni partagé avec des tiers.</li>
      </ul>

      <h2>Autorisations demandées</h2>
      {table_autorisations(a)}

      <h2>Données enregistrées sur l’appareil</h2>
      <p>{a["stockage"]}</p>{apple}{extra}

      <h2>Compte et suppression des données</h2>
      <p>{nom} ne propose pas de compte&#8239;: il n’y a donc aucun compte à supprimer. {a["suppression"]}</p>
      <p>Les sauvegardes de votre appareil (iCloud ou ordinateur) sont gérées par Apple selon vos réglages.</p>

      <h2>Éditeur et contact</h2>
      <dl>
        <div><dt>Éditeur</dt><dd>MTX Studio (identité complète dans les <a href="{root}mentions-legales.html">mentions légales</a>)</dd></div>
        <div><dt>Contact</dt><dd><a href="{mail(nom, 'Confidentialité')}">{MAIL}</a>, réponse sous un mois au plus</dd></div>
        <div><dt>Assistance</dt><dd><a href="{root}assistance/#{a["slug"]}">Page d’assistance</a></dd></div>
      </dl>
      <p>Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité prévus par le RGPD. Comme l’app ne transmet rien au studio, vos données sont entre vos mains&#8239;: écrivez-nous pour toute question. Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr/" rel="noopener">cnil.fr</a>).</p>

      <h2>Modifications</h2>
      <p>Si une nouvelle version de {nom} change la façon dont elle traite vos données, cette page est mise à jour avant sa publication. Mise à jour le {MAJ}.</p>
    </div>
  </div>
</div>'''
    p = dict(out=f'realisations/{a["slug"]}/confidentialite/index.html', path=f'realisations/{a["slug"]}/confidentialite/', root=root,
             css=['mtx.css'], js=['site.js'],
             title=f'Confidentialité de {nom} · MTX Studio',
             desc=f'Politique de confidentialité de l’app {nom} : autorisations demandées, données conservées sur l’appareil, aucun compte ni collecte par MTX Studio.',
             crumbs=[(nom, f'realisations/{a["slug"]}/'), ('Confidentialité', f'realisations/{a["slug"]}/confidentialite/')])
    return p, body

def page_assistance():
    root = '../'
    mail_assistance = gen.mailto('Assistance', 'Bonjour,\n\nApp :\nAppareil et version du système :\n\nMa question ou le problème rencontré :\n\n')
    mail_securite = gen.mailto('Signalement de sécurité', 'Bonjour,\n\nApp ou page concernée :\nDescription :\n\n')
    blocs = ''.join(f'''
      <h3 id="{a["slug"]}">{a["nom"]}</h3>
      <dl>
        <div><dt>Appareils</dt><dd>{a["appareils"]}, {a["systeme"]}</dd></div>
        <div><dt>Liens</dt><dd><a href="{root}realisations/{a["slug"]}/">Site de l’app</a> · <a href="{root}realisations/{a["slug"]}/confidentialite/">Confidentialité</a> · <a href="{mail(a["nom"], "Assistance")}">Écrire à l’assistance</a></dd></div>
      </dl>''' for a in APPS)
    body = f'''<div class="text-page">
  <div class="wrap">
    <header class="text-head">
      <nav aria-label="Fil d’Ariane"><ol class="crumbs"><li><a href="{root}">MTX Studio</a></li><li aria-current="page">Assistance</li></ol></nav>
      <h1 class="d1">Assistance des apps.</h1>
      <p class="lede">Une question, un problème, une idée pour l’une des apps de MTX Studio&#8239;? Écrivez directement au studio qui les développe&#8239;: réponse sous 24&nbsp;h ouvrées.</p>
    </header>

    <div class="text-body">
      <h2>Nous écrire</h2>
      <p>Écrivez à <a href="{mail_assistance}">{MAIL}</a> en précisant&#8239;:</p>
      <ul>
        <li>le nom de l’app et sa version (visible dans l’App Store ou les réglages de l’app)&#8239;;</li>
        <li>votre appareil et la version d’iOS, d’iPadOS, de watchOS ou de macOS&#8239;;</li>
        <li>ce que vous faisiez quand le problème est apparu, avec une capture d’écran si possible.</li>
      </ul>
      <p>N’envoyez pas de données personnelles sensibles ni de document confidentiel&#8239;: elles ne sont pas nécessaires pour vous aider.</p>

      <h2>Vos données et votre compte</h2>
      <p>Aucune des apps ci-dessous ne demande de créer un compte, et aucune n’envoie vos données au studio&#8239;: elles restent sur votre appareil. Il n’y a donc pas de compte à supprimer. Pour effacer vos données, supprimez-les depuis l’app ou supprimez l’app&#8239;; le détail figure dans la page de confidentialité de chaque app.</p>

      <h2>Les apps</h2>{blocs}

      <h2>Conditions d’utilisation</h2>
      <p>Les apps distribuées sur l’App Store sont soumises au <a href="{EULA}" rel="noopener">contrat de licence standard d’Apple pour les apps (EULA)</a>, sauf mention contraire sur leur fiche. Elles sont fournies par MTX Studio (<a href="{root}mentions-legales.html">mentions légales</a>).</p>

      <h2>Signaler un problème de sécurité</h2>
      <p>Si vous pensez avoir trouvé une faille dans une app ou sur ce site, écrivez à <a href="{mail_securite}">{MAIL}</a> avec l’objet «&#8239;Signalement de sécurité&#8239;». Merci de ne pas la rendre publique avant notre réponse.</p>

      <p class="note">Mise à jour le {MAJ}.</p>
    </div>
  </div>
</div>'''
    p = dict(out='assistance/index.html', path='assistance/', root=root, css=['mtx.css'], js=['site.js', 'contact.js'],
             title='Assistance des apps · MTX Studio',
             desc='Assistance des apps de MTX Studio (GoRun, Space, MTX Viewer, Triade, Kompagnion, Mue) : contact, confidentialité, suppression des données, conditions.',
             crumbs=[('Assistance', 'assistance/')])
    return p, body

def build(p, body):
    url = O + p['path']
    graph = [gen.breadcrumbs(p), {"@type": "WebPage", "@id": url + "#page", "url": url, "name": p['title'], "inLanguage": "fr-FR",
             "isPartOf": {"@id": O + "#site"}, "description": p['desc']}]
    ld = {"@context": "https://schema.org", "@graph": graph}
    out = gen.head(p, ld) + gen.navbar(p) + '\n<main id="contenu">\n' + body + '\n</main>\n\n' + gen.footer(p) + '\n' + gen.SPRITE + '</body>\n</html>\n'
    out = gen.finish(out, p)
    dest = os.path.join(SITE, p['out'])
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, 'w', encoding='utf8').write(out)
    print(f"{p['out']:46s} {len(out)//1024:3d} Ko")

if __name__ == '__main__':
    build(*page_assistance())
    for a in APPS: build(*page_confidentialite(a))
