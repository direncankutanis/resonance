## Güncel durum — 20 Eylül 2026
Dört metadata dosyası ayrı CID'lerle yayımlandı ve Pinata public gateway üzerinden indirildi. Dosya ve gömülü görsel SHA-256 değerleri v2 manifest ile birebir eşleşti. Doğrulanmış karakter sırası constructor-uris.json içinde; ayrıntı publication-verification.json içindedir. Bu tek seferlik erişim kontrolü sürekli pin tutulmasını veya cüzdan/indexer görüntülemesini kanıtlamaz; bunlar bekliyor. Gerçek sözleşme yayımı ve mint yapılmadı.

Aşağıdaki klasör yükleme adımları alternatif yöntemdir. Mevcut dosyalar için yeniden yükleme gerekmez; bireysel CID'lere `/diren.json` gibi ek yol eklenmez. Yeniden kontrol için verify-file-cids.py kullanılır.

# IPFS publication checklist — v2 character learning passes

Status: prepared locally; not uploaded. No CID exists yet. No wallet or key is needed to prepare these files.

1. Choose an IPFS pinning service and sign in using your own account. Do not share credentials in chat. Confirm its retention terms before relying on it.
2. Upload the **metadata directory** with its four JSON files as an IPFS directory. metadata-upload.zip is a transport archive: extract it first unless the selected service explicitly supports extraction. Pinning the ZIP alone will not create the required directory paths.
3. Record the returned directory CID and gateway. Run `python3 verify-publication.py CID https://YOUR-GATEWAY/ipfs` from this directory. All four public files and embedded PNGs must match the saved hashes. The verifier creates the ordered constructor URI file only after successful verification.
4. Check metadata/image rendering in the intended NFT viewer. Data URI image compatibility is not yet proven. If necessary publish PNGs separately, update metadata and regenerate hashes before deployment.
5. Confirm pin retention, preserve a local backup, then proceed to contract deployment preparation. No automatic deployment or wallet transaction is performed by this package.

Character order: Diren, Ece, Eric, Ade. SHA-256 values in manifest.json are checksums, not IPFS CIDs. Gateway retrieval does not by itself prove indefinite storage or wallet rendering support.

This v2 package replaces v1 for future deployment. Do not mix old artwork/metadata or use an old directory CID. Actual publication was deferred by the user; this task prepares files without uploading them.
