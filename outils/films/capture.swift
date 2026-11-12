// Capture hors écran avec WebKit : une image d'une page, ou toutes les images d'un film.
//
//   capture image <url> <largeur> <hauteur> <sortie.png> [--sombre] [--attente ms] [--js "code"] [--page]
//   capture film  <url> <largeur> <hauteur> <ips> <dossier> [--sombre]
//
// Un film est une page qui expose window.film = { duree, aller(t) } : aller(t) pose l'image de l'instant t (en
// secondes) sans dépendre de l'horloge. Les images sortent en PNG (image-00000.png…), prêtes pour ffmpeg.
// Compilation : swiftc -O capture.swift -o capture
import AppKit
import WebKit

@MainActor
final class Capture: NSObject, WKNavigationDelegate {
  let vue: WKWebView
  let fenetre: NSWindow
  private var charge: CheckedContinuation<Void, Never>?

  init(largeur: CGFloat, hauteur: CGFloat, sombre: Bool) {
    let cadre = NSRect(x: 0, y: 0, width: largeur, height: hauteur)
    let config = WKWebViewConfiguration()
    config.suppressesIncrementalRendering = true
    vue = WKWebView(frame: cadre, configuration: config)
    fenetre = NSWindow(contentRect: cadre, styleMask: [.borderless], backing: .buffered, defer: false)
    super.init()
    let apparence = NSAppearance(named: sombre ? .darkAqua : .aqua)
    fenetre.appearance = apparence
    vue.appearance = apparence
    fenetre.contentView = vue
    fenetre.setFrameOrigin(NSPoint(x: -30000, y: -30000))
    fenetre.orderBack(nil)
    vue.navigationDelegate = self
  }

  func ouvrir(_ url: URL) async {
    await withCheckedContinuation { (c: CheckedContinuation<Void, Never>) in
      charge = c
      vue.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData))
    }
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { charge?.resume(); charge = nil }
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    FileHandle.standardError.write("Échec du chargement : \(error.localizedDescription)\n".data(using: .utf8)!)
    charge?.resume(); charge = nil
  }
  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    FileHandle.standardError.write("Échec du chargement : \(error.localizedDescription)\n".data(using: .utf8)!)
    charge?.resume(); charge = nil
  }

  @discardableResult
  func js(_ code: String, _ arguments: [String: Any] = [:]) async -> Any? {
    do { return try await vue.callAsyncJavaScript(code, arguments: arguments, in: nil, contentWorld: .page) }
    catch { FileHandle.standardError.write("JS : \(error)\n".data(using: .utf8)!); return nil }
  }

  func image(rect: CGRect? = nil) async throws -> CGImage {
    let conf = WKSnapshotConfiguration()
    if let rect { conf.rect = rect }
    let img = try await vue.takeSnapshot(configuration: conf)
    var r = CGRect(origin: .zero, size: img.size)
    guard let cg = img.cgImage(forProposedRect: &r, context: nil, hints: nil) else { throw NSError(domain: "capture", code: 1) }
    return cg
  }

  func ecrire(_ cg: CGImage, _ chemin: String) {
    let url = URL(fileURLWithPath: chemin)
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil) else { return }
    CGImageDestinationAddImage(dest, cg, nil)
    CGImageDestinationFinalize(dest)
  }
}

@MainActor
func principal() async {
  let a = CommandLine.arguments
  func option(_ nom: String) -> String? { if let i = a.firstIndex(of: nom), i + 1 < a.count { return a[i + 1] }; return nil }
  guard a.count >= 6, let url = URL(string: a[2]), let l = Double(a[3]), let h = Double(a[4]) else {
    print("usage : capture image <url> <l> <h> <sortie.png> [--sombre] [--attente ms] [--js code] [--page]\n        capture film <url> <l> <h> <ips> <dossier> [--sombre]")
    exit(2)
  }
  let sombre = a.contains("--sombre")
  let c = Capture(largeur: l, hauteur: h, sombre: sombre)
  await c.ouvrir(url)
  await c.js("await document.fonts.ready; return true")

  if a[1] == "image" {
    let attente = Double(option("--attente") ?? "600") ?? 600
    try? await Task.sleep(nanoseconds: UInt64(attente * 1_000_000))
    if let code = option("--js") {
      await c.js(code)
      try? await Task.sleep(nanoseconds: 400_000_000)
    }
    do {
      if a.contains("--page") {
        // Toute la page : la vue prend la hauteur du document.
        let total = (await c.js("return Math.ceil(document.documentElement.scrollHeight)") as? Double) ?? h
        let haut = min(total, 30000)
        c.fenetre.setContentSize(NSSize(width: l, height: haut))
        c.vue.setFrameSize(NSSize(width: l, height: haut))
        try? await Task.sleep(nanoseconds: 900_000_000)
        if let code = option("--js") { await c.js(code); try? await Task.sleep(nanoseconds: 400_000_000) }
      }
      c.ecrire(try await c.image(), a[5])
    } catch { FileHandle.standardError.write("Capture impossible : \(error)\n".data(using: .utf8)!); exit(1) }
    exit(0)
  }

  // Film
  guard a.count >= 7, let ips = Double(a[5]) else { exit(2) }
  let dossier = a[6]
  try? FileManager.default.createDirectory(atPath: dossier, withIntermediateDirectories: true)
  let duree = (await c.js("return window.film.duree") as? Double) ?? 0
  let debut = Double(option("--de") ?? "0") ?? 0
  let fin = Double(option("--a") ?? String(duree)) ?? duree
  let premier = Int((debut * ips).rounded()), dernier = Int((fin * ips).rounded())
  let depart = Date()
  for i in premier..<dernier {
    await c.js("await window.film.aller(t); return true", ["t": Double(i) / ips])
    do { c.ecrire(try await c.image(), String(format: "%@/image-%05d.png", dossier, i)) }
    catch { FileHandle.standardError.write("Image \(i) : \(error)\n".data(using: .utf8)!) }
  }
  print("\(dernier - premier) images en \(String(format: "%.1f", Date().timeIntervalSince(depart))) s → \(dossier)")
  exit(0)
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
Task { @MainActor in await principal() }
app.run()
