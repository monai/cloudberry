{
  "targets": [
    {
      "target_name": "keychain",
      "conditions": [
        ["OS=='mac'", {
          "sources": [
            "src/reallocarray.cc",
            "src/addon.cc",
            "src/keychain.mm",
            "src/async.cc"
          ],
          "link_settings": {
            "libraries": [
              "$(SDKROOT)/System/Library/Frameworks/AppKit.framework",
            ],
          },
        }]
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}
