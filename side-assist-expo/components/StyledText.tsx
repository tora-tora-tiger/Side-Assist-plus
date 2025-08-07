import { Text, TextProps } from "./Themed";

export function MonoText(props: TextProps) {
  return <Text {...props} className={`font-mono ${props.className || ""}`} />;
}
