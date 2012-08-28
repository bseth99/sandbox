module Jekyll

  class Site

    def page_attr_hash(page_attr)
      # Build a hash map based on the specified page attribute ( page attr =>
      # array of pages )
      hash = Hash.new { |hsh, key| hsh[key] = Array.new }
      self.pages.each { |p| p.send(page_attr.to_sym).each { |t| hash[t] << p } }
      hash
    end

    alias orig_site_payload site_payload
    def site_payload
      h = orig_site_payload

      payload = h["site"]
      payload["tags"] = payload["tags"].merge(page_attr_hash('tags'))
      h["site"] = payload

      h
    end

  end
end
