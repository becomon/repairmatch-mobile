import { useEffect, useMemo, useRef, type ComponentType, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import { colors, radius } from '@/shared/theme';
import { useReduceMotion } from '@/shared/ui/motion';
import type { CoverageMapProps } from './coverageMapTypes';
import { DEMAND_CIRCLE_METERS } from './demand';
import { DemandChip } from './DemandChip';

// react-native-webview 14 class typings resolve to `never` props under @types/react 19.3.
const Web = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebView> }>;

/**
 * Leaflet + OpenStreetMap inside a WebView: no API key, no billing, and it runs the same in Expo Go
 * and in a standalone APK. The pin is draggable, a tap moves it, and nearby requests are drawn as
 * soft circles at their approximate point, so a technician sees where demand is without any home.
 */
export function CoverageMap({ latitude, longitude, radiusKm, onPinMoved, demand, onOpenDemand }: CoverageMapProps) {
  const web = useRef<WebView>(null);
  const reduce = useReduceMotion();
  const points = useMemo(() => (demand?.ready ? demand.points : []), [demand]);
  const loaded = useRef(false);
  // The pin's own move must not re-frame the map.
  const ownMove = useRef<string | null>(null);

  const state = useMemo(
    () =>
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        radius: radiusKm * 1000,
        points: points.map((p) => ({ id: p.requestId, lat: p.latitude, lng: p.longitude, color: p.color, label: p.label, km: p.distanceKm })),
      }),
    [latitude, longitude, radiusKm, points],
  );

  useEffect(() => {
    if (!loaded.current) return;
    const key = `${latitude},${longitude}`;
    const frame = ownMove.current !== key;
    ownMove.current = null;
    web.current?.injectJavaScript(`window.rmUpdate(${state}, ${frame}); true;`);
  }, [state, latitude, longitude]);

  function onMessage(event: WebViewMessageEvent) {
    const msg = JSON.parse(event.nativeEvent.data) as { type: string; lat?: number; lng?: number; id?: number };
    if (msg.type === 'ready') {
      loaded.current = true;
      web.current?.injectJavaScript(`window.rmUpdate(${state}, true); true;`);
    } else if (msg.type === 'move' && msg.lat !== undefined && msg.lng !== undefined) {
      const lat = Number(msg.lat.toFixed(6));
      const lng = Number(msg.lng.toFixed(6));
      ownMove.current = `${lat},${lng}`;
      onPinMoved(lat, lng);
    } else if (msg.type === 'demand') {
      const point = points.find((p) => p.requestId === msg.id);
      if (point) onOpenDemand?.(point);
    }
  }

  const html = useMemo(() => buildHtml(reduce), [reduce]);
  return (
    <View style={styles.frame} accessibilityLabel="Mapa de tu zona de atención. Arrastra el pin o toca el mapa para moverlo.">
      <Web
        ref={web}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        scrollEnabled={false}
        nestedScrollEnabled
      />
      {demand?.ready ? <DemandChip count={points.length} /> : null}
    </View>
  );
}

function buildHtml(reduce: boolean): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<style>html,body,#m{margin:0;height:100%;background:${colors.neutralSoft}}
.rm-pulse{animation:${reduce ? 'none' : 'rmp 1.8s ease-in-out infinite alternate'}}
@keyframes rmp{from{fill-opacity:.18}to{fill-opacity:.3}}</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
var post=function(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))};
var map=L.map('m',{zoomControl:false,attributionControl:true});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
var pin=L.circleMarker([0,0],{radius:9,color:'#fff',weight:3,fillColor:'${colors.primary}',fillOpacity:1}).addTo(map);
var area=L.circle([0,0],{radius:1,color:'${colors.primary}',weight:2,fillColor:'${colors.primary}',fillOpacity:.1}).addTo(map);
var layer=L.layerGroup().addTo(map);
var dragging=false;
pin.on('mousedown',function(){dragging=true;map.dragging.disable()});
map.on('mousemove',function(e){if(dragging)pin.setLatLng(e.latlng)});
map.on('mouseup',function(e){if(dragging){dragging=false;map.dragging.enable();post({type:'move',lat:e.latlng.lat,lng:e.latlng.lng})}});
map.on('click',function(e){pin.setLatLng(e.latlng);post({type:'move',lat:e.latlng.lat,lng:e.latlng.lng})});
window.rmUpdate=function(s,frame){
  var c=[s.lat,s.lng];pin.setLatLng(c);area.setLatLng(c);area.setRadius(s.radius);
  layer.clearLayers();
  s.points.forEach(function(p){
    var z=L.circle([p.lat,p.lng],{radius:${DEMAND_CIRCLE_METERS},color:p.color,weight:1,opacity:.35,fillColor:p.color,fillOpacity:.2,className:'rm-pulse'});
    z.on('click',function(ev){L.DomEvent.stopPropagation(ev);post({type:'demand',id:p.id})});
    var d=L.circleMarker([p.lat,p.lng],{radius:6,color:p.color,weight:2,fillColor:'#fff',fillOpacity:1});
    d.on('click',function(ev){L.DomEvent.stopPropagation(ev);post({type:'demand',id:p.id})});
    layer.addLayer(z);layer.addLayer(d);
  });
  if(frame)map.fitBounds(area.getBounds(),{padding:[16,16],animate:false});
};
post({type:'ready'});
</script></body></html>`;
}

const styles = StyleSheet.create({
  frame: { height: 280, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.neutralSoft },
  map: { flex: 1, backgroundColor: colors.neutralSoft },
});
