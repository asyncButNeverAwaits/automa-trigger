; Get the target URL from the first command-line argument.
; If no argument is passed, targetUrl will be empty, and Chrome will open its default page.
browserExe := A_Args[1]
arguments := A_Args[2]
targetUrl := A_Args[3]

; Get the active window's ID
hwnd := WinActive("A")

; Store original window properties
WinGetPos, originalX, originalY, originalWidth, originalHeight, ahk_id %hwnd%
WinGet, originalMinMax, MinMax, ahk_id %hwnd%
WinGet, originalExStyle, ExStyle, ahk_id %hwnd%
isOriginallyAlwaysOnTop := (originalExStyle & 0x8) ; WS_EX_TOPMOST check

; Maximize the window and set it to AlwaysOnTop
; WinMaximize, ahk_id %hwnd%
WinSet, AlwaysOnTop, On, ahk_id %hwnd%

; Run Chrome with the specified URL (if any)
Run, %browserExe% %arguments% %targetUrl%
WinWait, ahk_exe %browserExe%, , 5 ; Wait up to 5 seconds for Chrome window

; If Chrome appeared, minimize it (optional, based on original script)
IfWinExist, ahk_exe %browserExe%
{
    WinMinimize, ahk_exe %browserExe%
}

; Re-activate the original window
WinActivate, ahk_id %hwnd%

; Restore original AlwaysOnTop state
if (isOriginallyAlwaysOnTop)
    WinSet, AlwaysOnTop, On, ahk_id %hwnd%
else
    WinSet, AlwaysOnTop, Off, ahk_id %hwnd%

; Restore original window position/state
if (originalMinMax = 1) ; Was Maximized
{
    WinMaximize, ahk_id %hwnd%
}
else if (originalMinMax = -1) ; Was Minimized
{
    WinRestore, ahk_id %hwnd% ; Restore first, then minimize if it was truly minimized not just non-maximized
    WinMinimize, ahk_id %hwnd%
}
else ; Was Restored (neither maximized nor minimized)
{
    WinRestore, ahk_id %hwnd% ; Ensure it's not maximized/minimized before moving
    WinMove, ahk_id %hwnd%,, %originalX%, %originalY%, %originalWidth%, %originalHeight%
}

Return ; End of script