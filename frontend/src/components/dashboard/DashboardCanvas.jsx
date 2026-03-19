import GridLayout, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetCard from './WidgetCard';

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function DashboardCanvas({
  widgets,
  editable = false,
  onLayoutChange,
  onWidgetSettings,
  onWidgetDelete,
}) {
  const handleLayoutChange = (layout) => {
    if (onLayoutChange && editable) {
      onLayoutChange(layout);
    }
  };

  return (
    <div className={`min-h-[400px] ${editable ? 'grid-canvas' : ''}`}>
      <ResponsiveGridLayout
        className="layout"
        cols={12}
        rowHeight={60}
        isDraggable={editable}
        isResizable={editable}
        onLayoutChange={handleLayoutChange}
        compactType={null}
        preventCollision={false}
        margin={[12, 12]}
        containerPadding={[12, 12]}
        useCSSTransforms
      >
        {(widgets || []).map((widget) => {
          const gridData = {
            i: widget.id || widget._tempId,
            x: widget.grid_x ?? 0,
            y: widget.grid_y ?? 0,
            w: widget.grid_w ?? 4,
            h: widget.grid_h ?? 4,
            minW: 1,
            minH: 2
          };
          return (
            <div key={gridData.i} data-grid={gridData}>
              <WidgetCard
                widget={widget}
                editable={editable}
                onSettings={onWidgetSettings}
                onDelete={onWidgetDelete}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
