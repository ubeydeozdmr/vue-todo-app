import { createApp } from 'vue';
import './index.css';
import App from './App.vue';

const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  console.log(err);
  console.log(instance);
  console.log(info);
};

app.mount('#app');
