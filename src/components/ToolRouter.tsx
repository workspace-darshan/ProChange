"use client";
import DashboardTool from "@/components/tools/DashboardTool";
import SalaryCalculatorTool from "@/components/tools/SalaryCalculatorTool";
import TempMailTool from "@/components/tools/TempMailTool";
import MovieExplorerTool from "@/components/tools/MovieExplorerTool";
import CurrencyConverterTool from "@/components/tools/CurrencyConverterTool";
import MockDataGeneratorTool from "@/components/tools/MockDataGeneratorTool";
import ColorConverterTool from "@/components/tools/ColorConverterTool";
import TimestampConverterTool from "@/components/tools/TimestampConverterTool";
import QrGeneratorTool from "@/components/tools/QrGeneratorTool";
import WishesTemplatesTool from "@/components/tools/WishesTemplatesTool";
import Base64Tool from "@/components/tools/Base64Tool";
import JsonFormatterTool from "@/components/tools/JsonFormatterTool";
import SqlFormatterTool from "@/components/tools/SqlFormatterTool";
import XmlFormatterTool from "@/components/tools/XmlFormatterTool";
import CssUnitConverterTool from "@/components/tools/CssUnitConverterTool";
import CronParserTool from "@/components/tools/CronParserTool";
import CurlToFetchTool from "@/components/tools/CurlToFetchTool";
import UrlEncoderTool from "@/components/tools/UrlEncoderTool";
import HtmlEntitiesTool from "@/components/tools/HtmlEntitiesTool";
import JwtDecoderTool from "@/components/tools/JwtDecoderTool";
import JsonToTypesTool from "@/components/tools/JsonToTypesTool";
import JsonToCsvTool from "@/components/tools/JsonToCsvTool";
import JsonYamlTool from "@/components/tools/JsonYamlTool";
import NumberBaseTool from "@/components/tools/NumberBaseTool";
import MarkdownPreviewTool from "@/components/tools/MarkdownPreviewTool";
import PasswordGeneratorTool from "@/components/tools/PasswordGeneratorTool";
import UuidGeneratorTool from "@/components/tools/UuidGeneratorTool";
import LoremIpsumTool from "@/components/tools/LoremIpsumTool";
import HashGeneratorTool from "@/components/tools/HashGeneratorTool";
import RegexTesterTool from "@/components/tools/RegexTesterTool";
import TextAnalyzerTool from "@/components/tools/TextAnalyzerTool";
import JsonDiffTool from "@/components/tools/JsonDiffTool";
import WhiteboardCanvasTool from "@/components/tools/WhiteboardCanvasTool";
import ImageEditorTool from "@/components/tools/ImageEditorTool";
import SvgEditorTool from "@/components/tools/SvgEditorTool";
import WorldClockTool from "@/components/tools/WorldClockTool";
import WorldExplorerTool from "@/components/tools/WorldExplorerTool";
import WeatherTool from "@/components/tools/WeatherTool";
import AajKaDashboardTool from "@/components/tools/AajKaDashboardTool";
import TypingTestTool from "@/components/tools/TypingTestTool";

interface ToolRouterProps {
  toolId: string;
}

export default function ToolRouter({ toolId }: ToolRouterProps) {
  switch (toolId) {
    case "home":
      return <DashboardTool />;
    case "typing-test":
    case "typing-speed-test":
      return <TypingTestTool />;
    case "aaj-ka-dashboard":
    case "daily-dashboard":
      return <AajKaDashboardTool />;
    case "world-explorer":
      return <WorldExplorerTool />;
    case "world-clock":
      return <WorldClockTool />;
    case "weather":
    case "live-weather":
      return <WeatherTool />;
    case "canvas-board":
      return <WhiteboardCanvasTool />;
    case "image-editor":
      return <ImageEditorTool />;
    case "svg-editor":
      return <SvgEditorTool />;
    case "salary-calculator":
      return <SalaryCalculatorTool />;
    case "temp-mail":
      return <TempMailTool />;
    case "movie-explorer":
      return <MovieExplorerTool />;
    case "currency-converter":
      return <CurrencyConverterTool />;
    case "mock-data-generator":
      return <MockDataGeneratorTool />;
    case "color-converter":
      return <ColorConverterTool />;
    case "timestamp":
      return <TimestampConverterTool />;
    case "qr-generator":
      return <QrGeneratorTool />;
    case "wishes-templates":
      return <WishesTemplatesTool />;
    case "base64":
      return <Base64Tool />;
    case "json-formatter":
      return <JsonFormatterTool />;
    case "sql-formatter":
      return <SqlFormatterTool />;
    case "xml-formatter":
      return <XmlFormatterTool />;
    case "css-unit-converter":
      return <CssUnitConverterTool />;
    case "cron-parser":
      return <CronParserTool />;
    case "curl-to-fetch":
      return <CurlToFetchTool />;
    case "url-encoder":
      return <UrlEncoderTool />;
    case "html-entities":
      return <HtmlEntitiesTool />;
    case "jwt-decoder":
      return <JwtDecoderTool />;
    case "json-to-types":
      return <JsonToTypesTool />;
    case "json-to-csv":
      return <JsonToCsvTool />;
    case "json-yaml-converter":
      return <JsonYamlTool />;
    case "number-base":
      return <NumberBaseTool />;
    case "markdown-preview":
      return <MarkdownPreviewTool />;
    case "password-generator":
      return <PasswordGeneratorTool />;
    case "uuid-generator":
      return <UuidGeneratorTool />;
    case "lorem-ipsum":
      return <LoremIpsumTool />;
    case "hash-generator":
      return <HashGeneratorTool />;
    case "regex-tester":
      return <RegexTesterTool />;
    case "text-analyzer":
      return <TextAnalyzerTool />;
    case "json-diff":
      return <JsonDiffTool />;
    default:
      return <DashboardTool />;
  }
}
