<script>
import CheckSquare from './icons/check-square.vue';
import Square from './icons/square.vue';
import Pencil from './icons/pencil.vue';
import Trash from './icons/trash.vue';
import PlusCircle from './icons/plus-circle.vue';
import SwitchVertical from './icons/switch-vertical.vue';
import Circle from './icons/circle.vue';
import RecordCircle from './icons/record-circle.vue';
import ChevronRight from './icons/chevron-right.vue';
import ChevronBottom from './icons/chevron-bottom.vue';

let timeout;

export default {
  data() {
    return {
      data: {
        version: 1,
        // todos: [
        //   // NOTE: This is just a test object for development.
        //   {
        //     id: 987192045632,
        //     content: 'Hello World!',
        //     date: 1659877289968,
        //     completed: false,
        //   },
        //   {
        //     id: 526919297563,
        //     content: 'Drink a glass of water',
        //     date: 1659808439557,
        //     completed: false,
        //   },
        //   {
        //     id: 552267099247,
        //     content: 'Wash the dishes',
        //     date: 1659808434612,
        //     completed: true,
        //   },
        //   {
        //     id: 393829242937,
        //     content: 'Buy Minecraft Java&Bedrock Edition',
        //     date: 1659808426168,
        //     completed: false,
        //   },
        //   {
        //     id: 864336467614,
        //     content: "Finish Plato's Republic",
        //     date: 1659808404208,
        //     completed: false,
        //   },
        //   {
        //     id: 604908128095,
        //     content: "Finish Sofie's World",
        //     date: 1659808379333,
        //     completed: true,
        //   },
        // ],
        todos: [],
        preferences: {
          theme: 'os' /* light, dark, os */,
          sortType: 'date' /* date, name */,
          sortDesc: false,
          hideBanner: false,
          hideCompletedTodos: false,
          hideLastDeletedTodoNotifications: false,
          date: 'hide' /* hide, date, time, full */,
        },
      },
      cache: {
        activeTodos: undefined,
        expandPreferences: false,
        currentContent: '',
        lastDeletedTodo: undefined,
        showLastDeletedTodoNotification: false,
      },
    };
  },
  watch: {
    data: {
      handler(data) {
        localStorage.setItem('data', JSON.stringify(data));
      },
      deep: true,
    },
  },
  beforeCreate() {
    ///////////////////////////////////////////////////////////////
    /* Some fixes for datas from old versions (v1.1.0 and below) */
    if (localStorage.getItem('data')) {
      let checkObj = JSON.parse(localStorage.getItem('data'));

      if (!checkObj.version || checkObj.version < 1) {
        console.log("Old version detected. We're working on data object.");
        this.data = {};
        this.data.todos = JSON.parse(localStorage.getItem('data'));
        this.data.preferences = {};
        this.data.preferences.hideBanner = JSON.parse(localStorage.getItem('hideBanner'));
        /* prettier-ignore */
        this.data.preferences.hideCompletedTodos = JSON.parse(localStorage.getItem('hideCompletedTodos'));
        this.data.preferences.theme = JSON.parse(localStorage.getItem('theme'));
        this.data.preferences.sortType = JSON.parse(localStorage.getItem('sort'))[0];
        JSON.parse(localStorage.getItem('sort'))[1] === 'desc'
          ? (this.data.preferences.sortDesc = true)
          : (this.data.preferences.sortDesc = false);

        this.data.version = 1;

        localStorage.removeItem('hideBanner');
        localStorage.removeItem('hideCompletedTodos');
        localStorage.removeItem('theme');
        localStorage.removeItem('sort');

        localStorage.setItem('data', JSON.stringify(this.data));
      }
    }
    ///////////////////////////////////////////////////////////////
  },
  created() {
    localStorage.getItem('data')
      ? (this.data = JSON.parse(localStorage.getItem('data')))
      : localStorage.setItem('data', JSON.stringify(this.data));
  },
  mounted() {
    switch (this.data.preferences.theme) {
      case 'os':
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? document.querySelector('html').classList.add('dark')
          : document.querySelector('html').classList.remove('dark');
        break;
      case 'light':
        document.querySelector('html').classList.remove('dark');
        break;
      case 'dark':
        document.querySelector('html').classList.add('dark');
        break;
    }

    this.rearrangeTodos();
    this.hideCompletedTodosHandler();
  },
  methods: {
    filterTodos() {
      if (this.data.preferences.hideCompletedTodos) {
        return this.cache.activeTodos;
      } else {
        return this.data.todos;
      }
    },
    /**
     * @param {Number} id - ID property of object in todos array
     * @description - Sets true if the completed property of the selected to-do object is false, false if true.
     */
    toggleStatus(id) {
      this.data.todos.find(todo => todo.id === id).completed = !this.data.todos.find(
        todo => todo.id === id
      ).completed;
    },
    /**
     * @param {String} content - Content of the todo (content input will be taken from user)
     */
    addTodo() {
      this.cache.currentContent = this.cache.currentContent.trim();
      if (this.cache.currentContent === '') this.cache.currentContent = 'Blank to-do';
      let newTodo = {
        id: Math.round(Math.random() * 1000000000000),
        content: this.cache.currentContent,
        date: Date.now(),
        completed: false,
      };

      switch (this.data.preferences.sortType) {
        case 'name':
          this.data.preferences.sortDesc
            ? this.data.todos.push(newTodo)
            : this.data.todos.unshift(newTodo);
          break;
        default:
          /* Including case 'date': */
          this.data.preferences.sortDesc
            ? this.data.todos.unshift(newTodo)
            : this.data.todos.push(newTodo);
          break;
      }

      this.hideCompletedTodosHandler();

      this.cache.currentContent = '';
    },
    /**
     * @param {Number} id - ID property of the todo
     */
    removeTodo(id) {
      [this.cache.lastDeletedTodo] = this.data.todos.splice(
        this.data.todos.findIndex(todo => {
          return todo.id === id;
        }),
        1
      );

      if (!this.data.preferences.hideLastDeletedTodoNotifications) {
        this.cache.showLastDeletedTodoNotification = true;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.cache.showLastDeletedTodoNotification = false;
          this.cache.lastDeletedTodo = undefined;
        }, 7000);
      }

      this.hideCompletedTodosHandler();
    },
    /**
     * @description If you deleted any to-do by mistake, you can recover your last to-do.
     */
    recoverTodo() {
      clearTimeout(timeout);
      this.cache.showLastDeletedTodoNotification = false;

      switch (this.data.preferences.sortType) {
        case 'name':
          this.data.preferences.sortDesc
            ? this.data.todos.push(this.cache.lastDeletedTodo)
            : this.data.todos.unshift(this.cache.lastDeletedTodo);
          break;
        default:
          /* Including case 'date': */
          this.data.preferences.sortDesc
            ? this.data.todos.unshift(this.cache.lastDeletedTodo)
            : this.data.todos.push(this.cache.lastDeletedTodo);
          break;
      }
    },
    /**
     * @param {Date} date - Date in milliseconds
     * @returns new Date (localized)
     */
    formatDate(date) {
      switch (this.data.preferences.date) {
        case 'date':
          return new Date(date).toLocaleDateString();
        case 'time':
          return new Date(date).toLocaleTimeString();
        case 'full':
          return new Date(date).toLocaleString();
        default:
          return '';
      }
    },
    /**
     * @description - Handler for sorting todos.
     */
    rearrangeTodos() {
      switch (this.data.preferences.sortType) {
        case 'name':
          this.data.preferences.sortDesc
            ? this.data.todos.sort((a, b) => b.content.localeCompare(a.content))
            : this.data.todos.sort((a, b) => a.content.localeCompare(b.content));
          break;
        default:
          /* Including case 'date': */
          this.data.preferences.sortDesc
            ? this.data.todos.sort((a, b) => parseFloat(b.date) - parseFloat(a.date))
            : this.data.todos.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
          break;
      }

      this.hideCompletedTodosHandler();
    },
    hideCompletedTodosHandler() {
      this.cache.activeTodos = this.data.todos.filter(todo => !todo.completed);
    },
    // myFunc() {},
  },
  components: {
    CheckSquare,
    Square,
    Pencil,
    Trash,
    PlusCircle,
    SwitchVertical,
    Circle,
    RecordCircle,
    ChevronRight,
    ChevronBottom,
  },
};
</script>

<template>
  <div class="p-6 md:p-12 gap-6 md:gap-12 flex flex-col">
    <div class="w-full flex flex-col gap-3">
      <div>
        <h1 class="text-4xl font-bold dark:text-gray-200">Crema To-Do</h1>
      </div>
      <p v-if="this.data.todos.length === 0" class="dark:text-gray-300">
        You didn't add any to-do. To create your first to-do, type below then hit enter or
        the + sign.
      </p>
      <div class="w-full flex gap-3 md:gap-6" v-else>
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12"></div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click.prevent
            @click="
              this.data.preferences.sortDesc = !this.data.preferences.sortDesc;
              this.rearrangeTodos();
            "
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          >
            <SwitchVertical />
          </a>
        </div>
      </div>
      <div class="w-full flex flex-col gap-3">
        <div
          class="w-full flex gap-3 md:gap-6"
          v-for="todo in filterTodos()"
          :key="todo.id"
        >
          <div
            class="w-1/12 flex justify-center"
            :class="
              this.data.preferences.date !== 'hide' &&
              this.data.preferences.date !== undefined
                ? 'mt-2'
                : 'mt-0'
            "
          >
            <a
              href="#"
              @click.prevent
              v-if="todo.completed"
              @click="toggleStatus(todo.id)"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
            >
              <CheckSquare />
            </a>
            <a
              href="#"
              @click.prevent
              v-else="todo.completed"
              @click="toggleStatus(todo.id)"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
            >
              <Square />
            </a>
          </div>
          <div class="w-10/12 flex flex-col gap-1/2">
            <input
              type="text"
              :name="todo.id"
              :id="todo.id"
              v-model="todo.content"
              class="w-full dark:bg-gray-800 dark:text-gray-300"
              :class="
                todo.completed ? 'line-through text-gray-400 dark:text-gray-600' : ''
              "
            />
            <p
              v-if="
                this.data.preferences.date !== 'hide' &&
                this.data.preferences.date !== undefined
              "
              class="text-xs text-gray-800 dark:text-gray-400"
              :class="todo.completed ? 'text-gray-300 dark:text-gray-700' : ''"
            >
              {{
                this.data.preferences.date === 'full'
                  ? new Date(todo.date).toLocaleString()
                  : this.data.preferences.date === 'date'
                  ? new Date(todo.date).toLocaleDateString()
                  : new Date(todo.date).toLocaleTimeString()
              }}
            </p>
          </div>
          <div
            class="w-1/12 flex gap-3 justify-center"
            :class="
              this.data.preferences.date !== 'hide' &&
              this.data.preferences.date !== undefined
                ? 'mt-2'
                : 'mt-0'
            "
          >
            <a
              href="#"
              @click.prevent
              @click="removeTodo(todo.id)"
              class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
            >
              <Trash />
            </a>
          </div>
        </div>
      </div>

      <div class="w-full flex gap-3 md:gap-6">
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12">
          <input
            type="text"
            name="todoContent"
            id="todoContent"
            class="rounded w-full bg-gray-100 dark:bg-gray-700 dark:text-white px-3"
            v-model="cache.currentContent"
            v-on:keyup.enter="addTodo"
            placeholder="Add new todo from here..."
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click.prevent
            @click="addTodo"
            class="text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-200 transition-all duration-200"
          >
            <PlusCircle />
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <a
        href="#"
        @click.prevent
        @click="this.cache.expandPreferences = !this.cache.expandPreferences"
      >
        <h2
          class="text-md text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3"
        >
          <ChevronBottom v-if="this.cache.expandPreferences" />
          <ChevronRight v-else /> Preferences
        </h2>
      </a>
      <div class="flex flex-col gap-6" v-if="this.cache.expandPreferences">
        <p class="dark:text-gray-400 text-sm">Theme:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.theme = 'os'"
          >
            <RecordCircle
              v-if="
                this.data.preferences.theme === 'os' ||
                this.data.preferences.theme === undefined
              "
            />
            <Circle v-else />
            <p>System</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.theme = 'light'"
          >
            <RecordCircle v-if="this.data.preferences.theme === 'light'" />
            <Circle v-else />
            <p>Light</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.theme = 'dark'"
          >
            <RecordCircle v-if="this.data.preferences.theme === 'dark'" />
            <Circle v-else />
            <p>Dark</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">
          NOTE: After changing the theme, you need to refresh the page.
        </p>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="this.data.preferences.hideBanner = !this.data.preferences.hideBanner"
        >
          <CheckSquare v-if="this.data.preferences.hideBanner" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Created by" banner</p>
        </a>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.data.preferences.hideCompletedTodos =
              !this.data.preferences.hideCompletedTodos;
            this.hideCompletedTodosHandler();
          "
        >
          <!-- prettier-ignore -->
          <CheckSquare v-if="this.data.preferences.hideCompletedTodos" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide completed todos</p>
        </a>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.data.preferences.hideLastDeletedTodoNotifications =
              !this.data.preferences.hideLastDeletedTodoNotifications
          "
        >
          <!-- prettier-ignore -->
          <CheckSquare v-if="this.data.preferences.hideLastDeletedTodoNotifications" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Deleted to-do." notifications</p>
        </a>
        <p class="dark:text-gray-400 text-sm">
          NOTE: If you hide "Deleted to-do." notifications and delete any to-do by
          mistake, you won't be able to recover your last to-do.
        </p>
        <p class="dark:text-gray-400 text-sm">Date/Time:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.date = 'hide'"
          >
            <RecordCircle
              v-if="
                this.data.preferences.date === 'hide' ||
                this.data.preferences.date === undefined
              "
            />
            <Circle v-else />
            <p>Hide</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.date = 'date'"
          >
            <RecordCircle v-if="this.data.preferences.date === 'date'" />
            <Circle v-else />
            <p>Date</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.date = 'time'"
          >
            <RecordCircle v-if="this.data.preferences.date === 'time'" />
            <Circle v-else />
            <p>Time</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="this.data.preferences.date = 'full'"
          >
            <RecordCircle v-if="this.data.preferences.date === 'full'" />
            <Circle v-else />
            <p>Full</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">Sort type:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.data.preferences.sortType = 'date';
              this.rearrangeTodos();
            "
          >
            <RecordCircle
              v-if="
                this.data.preferences.sortType === 'date' ||
                this.data.preferences.sortType === undefined
              "
            />
            <Circle v-else />
            <p>Date</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.data.preferences.sortType = 'name';
              this.rearrangeTodos();
            "
          >
            <RecordCircle v-if="this.data.preferences.sortType === 'name'" />
            <Circle v-else />
            <p>Name</p>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-4"></div>
  <a
    v-if="!this.data.preferences.hideBanner"
    target="_blank"
    href="https://github.com/ubeydeozdmr/crema-todo"
    class="rounded text-xs text-center w-full bg-gray-200 dark:bg-gray-700 dark:text-gray-300 fixed bottom-0 left-0"
  >
    Created by Ubeyde Emir Özdemir with ❤️ Click for GitHub link
  </a>
  <!-- <button
    @click="myFunc"
    class="rounded text-sm bg-gray-200 absolute bottom-0 right-0"
  >
    Take a log for console (Just for development)
  </button> -->
  <div
    v-if="this.cache.showLastDeletedTodoNotification"
    class="absolute flex justify-between content-center bottom-8 left-3 right-3 md:left-1/3 md:right-1/3 bg-red-300 px-5 py-3 rounded"
  >
    <p class="inline-block py-1">Deleted to-do.</p>
    <div class="flex gap-3">
      <button @click="this.recoverTodo()" class="bg-white rounded px-2 py-1">UNDO</button>
      <a
        href="#"
        @click.prevent
        class="px-2 py-1 font-bold"
        @click="
          this.cache.showLastDeletedTodoNotification = false;
          this.cache.lastDeletedTodo = undefined;
        "
        >&#9587;</a
      >
    </div>
  </div>
</template>

<style scoped></style>
