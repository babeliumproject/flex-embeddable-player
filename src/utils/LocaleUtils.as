package utils
{
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;

	public class LocaleUtils
	{
		public static var DEFAULT_LOCALE:String="en_US";

		public static function arrangeLocaleChain(preferredLocale:String):void
		{
			var sourcelocale:String=DEFAULT_LOCALE;
			var rm:IResourceManager=ResourceManager.getInstance();

			var lchain:Array=rm.localeChain;
			var oldLocale:String=String(lchain.shift());

			if (preferredLocale == oldLocale)
				return;

			//Remove the new locale from the chain
			var nlangidx:int=lchain.indexOf(preferredLocale);
			if (nlangidx != -1)
				delete lchain[nlangidx];

			//Remove the source locale from the chain
			var srclangidx:int=lchain.indexOf(sourcelocale);
			if (srclangidx != -1)
				delete lchain[srclangidx];

			if (preferredLocale == sourcelocale)
			{
				lchain.unshift(preferredLocale);
				if (lchain.indexOf(oldLocale) == -1)
					lchain.push(oldLocale);
			}
			else
			{
				lchain.unshift(preferredLocale, sourcelocale);
				if (lchain.indexOf(oldLocale) == -1)
					lchain.push(oldLocale);
			}
			rm.localeChain=lchain;
		}

		public static function parseLocale(locale:String):String
		{
			var parsed_locale:String=DEFAULT_LOCALE;
			var language:String=null;
			var country:String=null;
			var available_languages:Array;
			if (locale)
			{
				available_languages=ResourceManager.getInstance().getLocales();
				var parts:Array=locale.split("_");
				if (parts.length > 0)
				{
					language=parts[0];
					if (parts.length > 1)
						country=(parts[1] as String).toUpperCase();
					for each (var l:String in available_languages)
					{
						var lparts:Array=l.split("_");
						if (country)
						{
							if (lparts[0] == language && lparts[1] == country)
							{
								parsed_locale=l;
								break;
							}
						}
						else
						{
							if (lparts[0] == language)
							{
								parsed_locale=l;
								break;
							}
						}
					}
				}
			}
			return parsed_locale;
		}
	}
}
