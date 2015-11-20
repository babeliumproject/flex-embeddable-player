package utils
{
	import mx.resources.ResourceManager;

	public class LocaleUtils
	{
		public static function parseLocale(locale:String):String{
			var parsed_locale:String='en_US';
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