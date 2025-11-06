# AR.js Marker Options

AR.js supports three types of markers for marker-based AR experiences:

## 1. Preset Markers

Built-in markers that don't require any additional files:

- **`hiro`** - The default Hiro marker (most commonly used)
- **`kanji`** - Kanji character marker
- **`Custom`** or **`custom`** - Uses custom pattern marker from `patternUrl` (see Pattern Markers section)

**Usage in YAML:**
```yaml
marker:
  preset: "hiro"  # or "kanji" or "Custom"
  patternUrl: ""  # Required when preset is "Custom"
```

**Example:**
```yaml
- id: example-hiro
  name: Example with Hiro Marker
  type: marker
  marker:
    preset: "hiro"
    patternUrl: ""
```

## 2. Barcode Markers

Auto-generated markers based on matrix computations. Values range from 0 to 999.

**Usage in YAML:**
```yaml
marker:
  preset: ""
  patternUrl: ""
  barcodeValue: 5  # Any number from 0-999
```

**Example:**
```yaml
- id: example-barcode
  name: Example with Barcode Marker
  type: marker
  marker:
    preset: ""
    patternUrl: ""
    barcodeValue: 42
```

**Note:** When using barcode markers, you can print them using AR.js barcode generator tools or use predefined barcode images.

## 3. Pattern Markers (Custom)

Custom markers created from your own images. Requires generating a `.patt` file.

**Usage in YAML (Two ways):**

**Option 1: Using "Custom" preset (Recommended - cleaner syntax):**
```yaml
marker:
  preset: "Custom"  # or "custom"
  patternUrl: "assets/patterns/your-marker.patt"
```

**Option 2: Using patternUrl only:**
```yaml
marker:
  preset: ""
  patternUrl: "assets/patterns/your-marker.patt"
```

**Example:**
```yaml
- id: example-pattern
  name: Example with Custom Pattern
  type: marker
  marker:
    preset: "Custom"
    patternUrl: "assets/patterns/custom-marker.patt"
```

### Creating Pattern Markers

1. **Use AR.js Marker Training Tool:**
   - Visit: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
   - Upload your image (high contrast, distinct features work best)
   - Download the generated `.patt` file
   - Place it in your `assets/patterns/` folder

2. **Best Practices for Pattern Images:**
   - High contrast (black and white work best)
   - Distinct geometric patterns
   - Avoid repetitive patterns
   - Minimum 512x512 pixels recommended
   - Square aspect ratio preferred

## Complete YAML Example

```yaml
- id: hiro-example
  name: Hiro Marker Example
  type: marker
  marker:
    preset: "hiro"
    patternUrl: ""
  videoUrl: "assets/videos/example.mp4"

- id: barcode-example
  name: Barcode Marker Example
  type: marker
  marker:
    preset: ""
    patternUrl: ""
    barcodeValue: 100
  videoUrl: "assets/videos/example.mp4"

- id: pattern-example
  name: Custom Pattern Example
  type: marker
  marker:
    preset: "Custom"  # Can also use "" with patternUrl
    patternUrl: "assets/patterns/my-custom-marker.patt"
  videoUrl: "assets/videos/example.mp4"
```

## Priority Order

The code checks markers in this order:
1. **Custom Preset** (if preset is "Custom" or "custom" with patternUrl)
2. **Preset** (if preset is "hiro" or "kanji")
3. **Barcode** (if barcodeValue is provided)
4. **Pattern** (if patternUrl is provided)
5. **Default** (falls back to "hiro" preset)

## Marker Images

You can find printable marker images at:
- Hiro marker: https://ar-js-org.github.io/AR.js/data/images/HIRO.jpg
- Kanji marker: https://ar-js-org.github.io/AR.js/data/images/KANJI.jpg
- Barcode markers: Use AR.js barcode generator or predefined barcodes

