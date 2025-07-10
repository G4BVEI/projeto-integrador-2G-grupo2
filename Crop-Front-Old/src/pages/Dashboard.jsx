import { useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import L from 'leaflet';
import { Chart, registerables } from 'chart.js';
import 'leaflet/dist/leaflet.css';

Chart.register(...registerables);

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-green: #2E7D32;
    --light-green: #81C784;
    --dark-green: #1B5E20;
    --background: #F5F7FA;
    --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--background);
    margin: 0;
    padding: 0;
    color: #333;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.div`
  background: white;
  box-shadow: var(--card-shadow);
  width: 16rem;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: rgba(46, 125, 50, 0.1);
  }
  &.active {
    background-color: rgba(46, 125, 50, 0.2);
    color: var(--primary-green);
    font-weight: 500;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Main = styled.main`
  flex: 1;
  overflow: auto;
  padding: 1rem;
  background-color: #f3f4f6;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  padding: 1rem;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

function Dashboard() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([-15.7942, -47.8822], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      L.marker([-15.7942, -47.8822]).addTo(mapRef.current)
        .bindPopup('Fazenda Modelo<br>Área cultivada: 142 ha')
        .openPopup();
    }

    const precipitationCanvas = document.getElementById('precipitationChart');
    const temperatureCanvas = document.getElementById('temperatureChart');

    if (precipitationCanvas) {
      new Chart(precipitationCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Precipitação (mm)',
            data: [0, 2.4, 5.2, 0, 0, 0.8, 0],
            backgroundColor: '#81C784',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'mm' } }
          }
        }
      });
    }

    if (temperatureCanvas) {
      new Chart(temperatureCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Temperatura (°C)',
            data: [28, 26, 24, 22, 21, 23, 27],
            borderColor: '#E57373',
            backgroundColor: 'transparent',
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: false, min: 20, title: { display: true, text: '°C' } }
          }
        }
      });
    }

    // Limpa o mapa se o componente for desmontado
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Sidebar>
          <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <img src="https://placehold.co/40x40" alt="Logo" style={{ marginRight: '0.75rem' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>CropSense</span>
          </div>
          <nav style={{ flex: 1, marginTop: '1rem' }}>
            <ul>
              <NavItem className="active">
                <img src="https://placehold.co/20x20" alt="Dashboard" style={{ marginRight: '0.75rem' }} />
                <span>Dashboard</span>
              </NavItem>
            </ul>
          </nav>
        </Sidebar>
        <Content>
          <Header>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Dashboard</h1>
          </Header>
          <Main>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Localização das Lavouras</h2>
                    <button style={{ fontSize: '0.875rem', color: '#2E7D32', fontWeight: '500' }}>Ver todas</button>
                  </div>
                  <div id="map" style={{ height: '300px', borderRadius: '10px' }}></div>
                </Card>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <Card>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Precipitação (últimos 7 dias)</h2>
                    <div style={{ height: '200px' }}>
                      <canvas id="precipitationChart"></canvas>
                    </div>
                  </Card>
                  <Card>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Temperatura Média</h2>
                    <div style={{ height: '200px' }}>
                      <canvas id="temperatureChart"></canvas>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <Card>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Resumo</h2>
                  <p>Área Cultivada: 142 ha</p>
                  <p>Umidade do Solo: 72%</p>
                  <p>NDVI: 0.78</p>
                  <p>Produtividade: 84 sc/ha</p>
                </Card>
              </div>
            </div>
          </Main>
        </Content>
      </Container>
    </>
  );
}

export default Dashboard;
