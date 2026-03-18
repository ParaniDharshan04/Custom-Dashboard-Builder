import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetCard from './WidgetCard';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardCanvas({
  widgets,
  editable = false,
  onLayoutChange,
  onWidgetSettings,
  onWidgetDelete,
}) {
  const generateLayouts = () => {
    const items = (widgets || []).map((w) => ({
      i: w.id || w._tempId,
      x: w.grid_x ?? 0,
      y: w.grid_y ?? 0,
      w: w.grid_w ?? 4,
      h: w.grid_h ?? 4,
      minW: 1,
      minH: 2,
    }));
    return { lg: items, md: items, sm: items };
  };

  const handleLayoutChange = (layout, allLayouts) => {
    if (onLayoutChange && editable) {
      onLayoutChange(layout);
    }
  };

  return (
    <div className={`min-h-[400px] ${editable ? 'grid-canvas' : ''}`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={generateLayouts()}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 8, sm: 4 }}
        rowHeight={60}
        isDraggable={editable}
        isResizable={editable}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        margin={[12, 12]}
        containerPadding={[12, 12]}
        useCSSTransforms
      >
        {(widgets || []).map((widget) => (
          <div key={widget.id || widget._tempId}>
            <WidgetCard
              widget={widget}
              editable={editable}
              onSettings={onWidgetSettings}
              onDelete={onWidgetDelete}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
