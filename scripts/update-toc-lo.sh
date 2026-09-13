#!/usr/bin/env bash
# Rellena el campo TOC que pandoc escribe en los DOCX de export/docx.
# Word actualiza el índice al abrir el documento, pero para que el archivo
# ya lo traiga rellenado (y para renderizar a PDF) se actualiza aquí con
# LibreOffice usando un perfil temporal desechable.
#
# Uso: bash scripts/update-toc-lo.sh   (invocado por `pnpm docs:docx`)

set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/export/docx"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT

soffice --headless -env:UserInstallation="file://$PROFILE" --terminate_after_init >/dev/null 2>&1 || true

mkdir -p "$PROFILE/user/basic/Standard"
cat > "$PROFILE/user/basic/Standard/Module1.xba" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE script:module PUBLIC "-//OpenOffice.org//DTD OfficeDocument 1.0//EN" "module.dtd">
<script:module xmlns:script="http://openoffice.org/2000/script" script:name="Module1" script:language="StarBasic">Sub UpdateAllTocs
  Dim sDir As String
  Dim sFile As String
  Dim oDoc As Object
  Dim i As Integer
  Dim oArgs(0) As New com.sun.star.beans.PropertyValue
  On Error GoTo Handler
  sDir = "$OUT_DIR/"
  oArgs(0).Name = "Hidden" : oArgs(0).Value = True
  sFile = Dir(sDir &amp; "*.docx")
  Do While sFile &lt;&gt; ""
    oDoc = StarDesktop.loadComponentFromURL(ConvertToURL(sDir &amp; sFile), "_blank", 0, oArgs())
    oDoc.refresh()
    For i = 0 To oDoc.getDocumentIndexes().Count - 1
      oDoc.getDocumentIndexes().getByIndex(i).update()
    Next i
    oDoc.store()
    oDoc.close(False)
    sFile = Dir()
  Loop
  StarDesktop.terminate()
  Exit Sub
Handler:
  StarDesktop.terminate()
End Sub</script:module>
EOF

soffice --headless -env:UserInstallation="file://$PROFILE" "macro:///Standard.Module1.UpdateAllTocs" >/dev/null 2>&1 || true

echo "✓ Índices TOC actualizados en $OUT_DIR"
