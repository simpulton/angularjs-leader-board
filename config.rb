# =================================================
#   Compass Sass Configuration File
#
#     CONFIG REFERENCE: http://bit.ly/mdB26R
# =================================================

# =================================================
#   ASSET STRUCTURE     
# =================================================
    http_path = "public"
    css_dir = "public/css"
    images_dir = "public/images"
    javascripts_dir = "public/js"

    sass_dir = "sass"

# =================================================
#   COMPILE / BUILD OPTIONS
# =================================================

    # $ compass compile -e development --force
    if environment != :production
        output_style = :compact
        line_comments = true
        disable_warnings = false
        # give us all the info
        disable_warnings = true
        sass_options = {:quiet => true}
    end

    # $ compass compile -e production --force
    if environment == :production 
        output_style = :compressed
        line_comments = false
        # keep the build output nice and clean
        disable_warnings = true
        sass_options = {:quiet => true}
    end

    # Enable relative paths to assets
    # via compass helper functions:
    relative_assets = true

# =================================================
#   CUSTOM SASS FUNCTIONS
# =================================================

    module Sass::Script::Functions

        # output a new hexidecimal string
        def hex_str(decimal)
            Sass::Script::String.new("%02x" % decimal)
        end

        #output a hexidecimal string for Internet Explorer's Alpha Filter Hacks
        def ie_hex_str(color)
            assert_type color, :Color
            alpha = (color.alpha * 255).round.to_s(16).rjust(2, '0')
            Sass::Script::String.new("##{alpha}#{color.send(:hex_str)[1..-1]}".upcase)
        end
        declare :ie_hex_str, [:color]

        # Inspects the unit of the number, returning the number only
        # @param string [String] The number to inspect
        # @return [Literal] The number without its unit
        def value(string)
            Sass::Script::Number.new(string.value)
        end
        declare :value, [:number]

    end

# =================================================    
#   UTILITIES / SUPPORT
# =================================================

    # Support for repeating-linear-gradient: http://bit.ly/Odh24F
    Compass::BrowserSupport.add_support('repeating-linear-gradient', 'webkit', 'moz', 'o', 'ms')
