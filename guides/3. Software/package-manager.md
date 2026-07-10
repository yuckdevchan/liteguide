# Package Manager
A [package manager](package-manager) is a program used for installing and updating other software programs on a computer.

(w) Using a package manager to download from a [repository](software-repository) (or repo) is like using an app store. App stores are types of package managers, but they won't be talked about here, as people usually exclude them when referring to package managers.

Package managers are often [CLI](cli), [GUI](gui), or both.

When a user requests a package through their package manager, an online, centralised repository of software will return the compressed package, which can then be installed onto the computer.

On [Windows](microsoft-windows), there is a built in package manager called [WinGet](windows-package-manager). There are many third-party ones too, such as [Chocolatey](https://chocolatey.org/) and [Scoop](https://scoop.sh/).

On [Linux](linux) distributions there are package managers such as [apt](APT%20(software)), [dnf](DNF%20(software)), [pacman](Arch-Linux#Pacman), [zypper](zypper), and the [flatpak](flatpak) command line tool.

On [macOS](macos), there is a popular third-party package manager called [Homebrew](https://brew.sh/).

## Pros
- Can be more secure, software can be vetted by the repo maintainers.
- Can handle dependencies automatically
- Can handle updates and uninstalling automatically.

## Cons
- If the wrong version of a critical dependency is installed, it can cause lots of software to stop working and even break the operating system, making it very difficult to fix.
